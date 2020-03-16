import React, {Component} from "react";

import "./date-time-field.css";

interface IDateTimeFieldProps {
    onChange: (datetime: Date) => void;
    value: Date;
    caption?: string;
}
interface IDateTimeFieldState {
    date: string;
    time: string;
    errors: {[key: string]: string};
}

export class DateTimeField extends Component<IDateTimeFieldProps, IDateTimeFieldState> {
    constructor(props: IDateTimeFieldProps) {
        super(props);
        this.state = {
            date: props.value && this.formatDate(props.value),
            time: props.value && this.formatTime(props.value),
            errors: {},
        };
    }

    public render() {
        const {caption} = this.props;
        const {date, time, errors} = this.state;
        return (<>
            {caption && <h5>{caption}</h5>}
            <div className="dd-field date-time-field">
                <div className={`dd-field-col ${errors.date && "error"}`}>
                    <label>Date</label>
                    <input
                        value={date}
                        type="date"
                        onChange={(e) =>
                            this.setState({date: e.target.value}, () => this.updateDate())
                        }
                    />
                    {errors.date && <span className="field-error">{errors.date}</span>}
                </div>
                <div className={`dd-field-col ${errors.time && "error"}`}>
                    <label>Time</label>
                    <input
                        value={time}
                        type="time"
                        onChange={(e) =>
                            this.setState({time: e.target.value}, () => this.updateDate())
                        }
                    />
                    {errors.time && <span className="field-error">{errors.time}</span>}
                </div>
            </div>
        </>);
    }

    private formatDate(d: Date): string {
        return `${d.getUTCFullYear()}-${`${d.getUTCMonth() + 1}`.padStart(2, "0")}-${`${d.getDate()}`.padStart(2, "0")}`;
    }

    private formatTime(d: Date): string {
        return `${`${d.getUTCHours()}`.padStart(2, "0")}:${`${d.getUTCMinutes()}`.padStart(2, "0")}`;
    }

    private updateDate() {
        const {onChange} = this.props;
        const {date, time} = this.state;
        let d: Date;
        let t: Date;
        let wrongDate = false;
        try {
            if (!date.match(/\d{4}-\d{1,2}-\d{1,2}/)) throw new Error(`format should be YYYY-MM-DD ~ ${date}`);
            d = new Date(date);
            this.setState(({errors}) => ({errors: {...errors, date: undefined}}));
        } catch (e) {
            this.setState(({errors}) => ({errors: {...errors, date: "Wrong date: " + e.message}}));
            wrongDate = true;
        }
        try {
            if (!time.match(/\d{2}:(\d{2}:)?(\d{2}:)?/)) throw new Error(`format should be HH:MM:SS ~ ${time}`);
            t = new Date(`1970.01.01 ${time}`);
            this.setState(({errors}) => ({errors: {...errors, time: undefined}}));
        } catch (e) {
            this.setState(({errors}) => ({errors: {...errors, time: "Wrong time: " + e.message}}));
            wrongDate = true;
        }

        if (!wrongDate && onChange) {
            d.setHours(t.getHours(), t.getMinutes(), t.getSeconds());
            onChange(d);
        }
    }
}
