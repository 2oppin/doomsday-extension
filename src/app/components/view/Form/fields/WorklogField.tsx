import {formatDate} from "@app/common/routines";
import {Task} from "@app/models/task";
import {Worklog} from "@app/models/worklog";
import {SyntheticEvent} from "react";
import * as React from "react";

import "./worklog-field.css";

enum WorklogLogAction {NONE, RESIZE_L, RESIZE_R, MOVE}

interface IWorklogFieldProps {
    worklog: Worklog[];
    readonly?: boolean;
    onChange?: (worklog: Worklog[]) => void;
}

interface IWorklogFieldState {
    range: number[];
    worklog: Worklog[];
    days: string[];
    done: number;
    selectedInx: number|null;
    action: WorklogLogAction;
    offsetX: number;
    virtWorklog: {day: string, left: string, width: string}|null;
}

export class WorklogField extends React.Component<IWorklogFieldProps, IWorklogFieldState> {
    protected virtLog = React.createRef<HTMLDivElement>();
    constructor(props: IWorklogFieldProps) {
        super(props);
        const worklog = this.normalizeWorklog(props.worklog);
        this.state = {
            ...this.getWorklogInfo(worklog),
            worklog,
            selectedInx: null,
            virtWorklog: null,
            action: WorklogLogAction.NONE,
            offsetX: 0,
        };
    }

    public render() {
        const {readonly} = this.props;
        const {worklog, days, range, done, selectedInx, virtWorklog} = this.state;
        return (
            <div className={`dd-worklog-field${readonly ? " readonly" : ""}`}>
                <h5>{(done / 3600000).toFixed(2)}h done in {worklog.length} logs for {days.length} days {
                    null} from {formatDate(new Date(range[0]))} till {formatDate(new Date(range[1]))}</h5>
                <ul className={"days"}>
                    {days.map((d) => (
                        <li key={d} className={selectedInx ? "has-selected" : ""}>
                            <label>{d}</label>
                            <div
                                className={"period"}
                                data-day={d}
                                onMouseMove={(e) => this.onMMove(e)}
                                onMouseDown={(e) => this.onMDown(e)}
                                onMouseUp={(e) => this.onMUp(e)}
                                onMouseLeave={(e) => this.setState({
                                    action: WorklogLogAction.NONE, virtWorklog: null, selectedInx: null,
                                })}
                            >
                                {this.periodsFromDay(d)}
                                {virtWorklog && virtWorklog.day === d && (
                                    <div ref={this.virtLog} className={`log virtual${this.getLRClass()}`} style={virtWorklog} />
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    private onMDown(e: SyntheticEvent<HTMLDivElement, MouseEvent>) {
        if (this.props.readonly || !this.state.selectedInx) return;
        const el = e.nativeEvent.target as HTMLDivElement;
        let log: HTMLDivElement;
        if (el.classList.contains("log")) {
            log = el;
        } else {
            const inx = this.detectNearestLogOnMouse(e);
            log = document.querySelector(`[data-index="${inx}"]`);
        }
        const period = log.parentElement;

        const {x, width} = log.getBoundingClientRect();
        let action = WorklogLogAction.RESIZE_R;
        if (e.nativeEvent.clientX < x) {
            action = WorklogLogAction.RESIZE_L;
        } else if (e.nativeEvent.clientX < x + width) {
            action = WorklogLogAction.MOVE;
        } else {
            action = WorklogLogAction.RESIZE_R;
        }
        this.setState({action});
    }

    private onMMaction(e: SyntheticEvent<HTMLDivElement, MouseEvent>) {
        const {worklog, action, selectedInx, offsetX} = this.state;
        const w = worklog.find((wl) => wl.started.getTime() === selectedInx);
        if (!w) return;

        const el = e.nativeEvent.target as HTMLDivElement;
        let log: HTMLDivElement;
        let period: HTMLDivElement;
        if (el.classList.contains("log")) {
            log = el;
            period = el.parentElement as HTMLDivElement;
        } else {
            period = el;
            log = period.querySelector(`[data-index="${selectedInx}"]`);
        }
        const {x, width} = period.getBoundingClientRect();
        let left: number;
        let logWidth: number;
        if (action === WorklogLogAction.MOVE) {
            logWidth = width * (w.finished.getTime() - w.started.getTime()) / (24 * 3600000);
            left = Math.min(e.nativeEvent.clientX - x, width - logWidth);
        }
        if (action === WorklogLogAction.RESIZE_L) {
            const right = width * (w.finished.getTime() - (new Date(`${period.dataset.day} 00:00:00`).getTime())) / (24 * 3600000);
            left = Math.min(e.nativeEvent.clientX - x, right);
            logWidth = right - left;
        }
        if (action === WorklogLogAction.RESIZE_R) {
            left = width * (w.started.getTime() - (new Date(`${period.dataset.day} 00:00:00`).getTime())) / (24 * 3600000);
            const right = Math.max(e.nativeEvent.clientX - x, left);
            logWidth = right - left;
        }
        if (left !== undefined && logWidth !== undefined)
            this.setState({
                virtWorklog: {
                    left: `${left}px`,
                    width: `${logWidth}px`,
                    day: period.dataset.day,
                },
            });
    }

    private onMUp(e: SyntheticEvent<HTMLDivElement|HTMLUListElement, MouseEvent>) {
        const virt: HTMLDivElement = this.virtLog.current;
        if (this.props.readonly || !virt) return;
        const period: HTMLDivElement = virt.parentElement as HTMLDivElement;
        const day = period.dataset.day;
        const periodBox = period.getBoundingClientRect();
        const {x, width} = virt.getBoundingClientRect();
        const started = new Date((new Date(`${day} 00:00:00`)).getTime() + 24 * 3600000 * (x - periodBox.x) / periodBox.width);
        const finished = new Date(started.getTime() + 24 * 3600000 * (width) / periodBox.width);

        this.setState(({worklog, selectedInx}) => {
            const updWorklog = this.normalizeWorklog([
                ...worklog.filter((w) => w.started.getTime() !== selectedInx),
                new Worklog({started, finished}),
            ]);
            return {
                ...this.getWorklogInfo(updWorklog),
                worklog: updWorklog,
                action: WorklogLogAction.NONE,
                virtWorklog: null,
            };
        }, () => this.props.onChange(this.state.worklog));
    }

    private onMMove(e: SyntheticEvent<HTMLDivElement, MouseEvent>) {
        if (this.props.readonly || this.state.action !== WorklogLogAction.NONE) {
            return this.onMMaction(e);
        }
        const el = e.nativeEvent.target as HTMLDivElement;
        let closest: number;
        if (el.classList.contains("log")) {
            closest = parseInt(el.dataset.index, 10);
        } else
            closest = this.detectNearestLogOnMouse(e);
        this.setState({selectedInx: closest});
    }

    private detectNearestLogOnMouse(e: SyntheticEvent<HTMLDivElement, MouseEvent>): number {
        let diff = 15;
        let selectedInx: number|null = null;
        const el = (e.nativeEvent.target as HTMLDivElement);
        el.childNodes.forEach((p: HTMLDivElement) => {
            const {x, width} = p.getBoundingClientRect();
            const tdiff = Math.min(Math.abs(e.nativeEvent.clientX - x), Math.abs(e.nativeEvent.clientX - width - x));

            if (tdiff < diff) {
                selectedInx = parseInt(p.dataset.index, 10);
                diff = tdiff;
            }
        });
        return selectedInx;
    }

    private periodsFromDay(d: string): React.ReactNode {
        const {worklog, selectedInx} = this.state;
        return worklog.filter((w) => formatDate(w.started) === d || formatDate(w.finished) === d)
            .map((w) => {
                const inx: number = w.started.getTime();
                const isSelected = selectedInx === inx;

                const left = (w.started.getTime() - (new Date(`${d} 00:00:00`)).getTime()) / (24 * 36000.0);
                const width = (w.finished.getTime() - w.started.getTime()) / (24 * 36000);
                return (
                    <div key={inx} data-index={inx}
                        className={`log ${!isSelected ? "" : ` selected${this.getLRClass()}`}`}
                        style={{left: `${left}%`, width: `${width}%`}}
                    />
                );
            });
    }

    private getLRClass(): string {
        const {action} = this.state;
        if (action === WorklogLogAction.RESIZE_R) return " r-border";
        if (action === WorklogLogAction.RESIZE_L) return " l-border";
        return "";
    }

    private normalizeWorklog(worklog: Worklog[]): Worklog[] {
        return worklog.sort(Task.sortByStarted).reduce<Worklog[]>((a, w) => {
            if (!w.finished) {
                w.finished = new Date();
            }
            const lastEl = a.slice(-1)[0];
            if (a.length && lastEl.isTooCloseTo(w)) {
                return [...a.slice(0, -1), lastEl.merge(w)];
            }
            const finishDay = formatDate(w.finished);
            if (formatDate(w.started) !== finishDay) {
                return [
                    ...a,
                    new Worklog({started: w.started, finished: new Date(finishDay)}),
                    new Worklog({started: new Date(finishDay), finished: w.finished}),
                ];
            }
            return [...a, w];
        }, []);
    }

    private getWorklogInfo(worklog: Worklog[]): {range: number[], done: number, days: string[]} {
        const daysObj: {[key: string]: boolean} = {};
        let done = 0;
        const range = worklog.reduce(
            (a, w) => {
                daysObj[formatDate(w.started)] = true;
                daysObj[formatDate(w.finished || new Date())] = true;
                done += w.done;
                return [Math.max(w.started.getTime(), a[0]), Math.min(w.finished.getTime() || (new Date()).getTime(), a[1])];
            },
            [-1, Number.MAX_VALUE],
        );
        return {
            range,
            done,
            days: Object.keys(daysObj),
        };
    }
}
