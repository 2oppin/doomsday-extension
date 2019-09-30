"use strict";

const ddPopupID = 'doomsday-popup-form';
const ddPopupCloseID = 'doomsday-popup-form-close';
const ddPopupTaskListID = 'doomsday-popup-form-task-list';
let ddPopupTaskList = document.getElementById(ddPopupTaskListID);
let ddPopup = document.getElementById(ddPopupID);
let ddPopupClose = document.getElementById(ddPopupCloseID);

const checkTime = (tm) => {
  return Number.isInteger(tm) ? new Date(tm*3600*1000 + (new Date()).getTime()) : new Date(tm);
};

const newTask = (name = 'New Task') => (hours = 2) => (deadline = 24) => (description = '') => ({
  name,
  hours: hours * 3600 * 1000,
  spent: 0,
  started: null,
  deadline: checkTime(deadline),
  description
});
const renderTasks = (tasks) => {
  let ul = document.createElement('ul');
  ul.setAttribute('style', `list-style-type: none;`);
  tasks.map(t => {
    let li = document.createElement('li');
    const bt = (unc) => `<span class="task-btn" style="
      display: inline-block;
      width: 30px;
      height: 30px;
      padding-top: 2px;
      line-height: 19px;
      font-size: 20px;
      font-weight: bold;
      text-align: center;
      cursor: pointer;
      border: outset 3px;
      box-sizing: border-box;
      color: black;">&#${unc};</span>`;
    li.innerHTML = `<li>${bt(9654)}${bt(9208)} - ${t.name}</li>`;
    ul.appendChild(li);
  })
  ddPopupTaskList.innerHTML = '';
  ddPopupTaskList.appendChild(ul);
};

function createDDPopup(conf, tabId) {
  if (ddPopup) ddPopup.remove();

  ddPopup = document.createElement('div');
  ddPopupClose = document.createElement('div');
  ddPopupClose.setAttribute('style', 
    `position: absolute;
     box-sizing: border-box;
	   width:25px;
	   height:25px;
	   top: 10px;
     right: 10px;
     line-height: 20px;
     font-size: 16px;
     font-weight: bold;
     text-align: center;
     background: red;
     cursor: pointer;
	   border: outset 3px;
     color: white;`
  );
  ddPopupClose.innerHTML = 'X';
  ddPopupTaskList = document.createElement('div');
  ddPopup.setAttribute('id', ddPopupTaskListID);
  let addTaskBtn = document.createElement('button')
  ddPopup.setAttribute('id', ddPopupID);
  ddPopup.setAttribute('style', 
     `position: fixed;
      box-sizing: border-box;
      top: 100px;
      left: 200px;
      background: #faa;
      border: ridge 10px;
      color: black;
      font-family: MONOSPACE;`);
  ddPopup.innerHTML = JSON.stringify(conf);
  ddPopupClose.addEventListener('click', () => {
    ddPopup.remove();
    ddPopup = null;
  });
  addTaskBtn.innerHTML = '+';
  addTaskBtn.addEventListener('click', () => {
    let task = newTask()()()();//(new Task()).plain;
    chrome.runtime.sendMessage({action: 'add', tabId, task});
  });
  ddPopup.appendChild(ddPopupTaskList);
  ddPopup.appendChild(addTaskBtn);
  ddPopup.appendChild(ddPopupClose);
  renderTasks(conf.tasks);
  document.body.appendChild(ddPopup);
  return ddPopup;
};
