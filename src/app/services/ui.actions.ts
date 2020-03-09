export const closeForm = (data: any) => ({data});
export const showForm = (data: any) => ({data});
export const showPanel = (data: any) => {
  if (data.panel)
    data.panel.create(data.config);
};
