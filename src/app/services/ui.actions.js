// import { Panel } from '../components/Panel.js';

export const closeForm = (data) => ({data});
export const showForm = (data) => ({data});
export const showPanel = (data) => {
  if (data.panel)// instanceof Panel)
    data.panel.create(data.config)
}
