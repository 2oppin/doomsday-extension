import {siteBase} from "@app/common/routines";

const statUri = `/rest/api/3/serverInfo`;
const currentUserUri = `/rest/api/3/myself`;

class JiraAPI {
    private user: {emailAddress: string, displayName: string, avatarUrls: {["48x48"]: string}};
    private active: Promise<boolean>;
    constructor(private baseUri: string) {
        if (document.querySelector(`meta[content="JIRA"]`)) {
            this.active =  this.getCurrentUser()
                .then((data) => !!data)
                .catch((e) => false);
        } else {
            this.active = Promise.resolve(false);
        }
    }

    public isJiraSite(): Promise<boolean> {
        return this.active;
    }

    public getActiveIssues() {
        const jql = encodeURIComponent(`assignee="${this.user.displayName}" AND status not in ("Resolved", "Done")`);
        return this.call(`search?jql=${jql}`);
    }

    public getCurrentUser() {
        return this.call("myself")
            .then((data) => {
                this.user = data;
                return this.user;
            });
    }

    public getStat(): Promise<boolean> {
        return this.call("serverInfo");
    }

    private call(jiraUri: string): Promise<any> {
        return fetch(`${this.baseUri}/rest/api/3/${jiraUri}`)
            .then((resp) => {
                if (resp.status < 200 || resp.status >= 400) throw new Error(`${resp.status}`);
                return resp.json();
            });
    }
}

export const Jira = new JiraAPI(siteBase());
