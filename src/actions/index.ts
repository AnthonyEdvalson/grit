//import moment, { Moment } from "moment";
import GritHistory from "../useGritHistory/GritHistory";
import Rate from "./Rate";
import Schedule from "./Schedule";


export class Action {
  name: string;
  key: string;
  rate: Rate;
  schedules: Schedule[];

  constructor(name: string, rate: Rate, schedules: Schedule[]) {
    this.name = name;
    this.key = name.toLowerCase();
    this.rate = rate;
    this.schedules = schedules;
  }
  /*
  deserialize(data: any) {
    this.history = new Map();
    let now = moment().startOf("day");

    for (let i = 0; i < 7; i++) {
      let day = now.subtract(i, "days");
      let dayString = day.format(dayFormat);

      if (dayString in data.history)
        this.history.set(dayString, data.history[dayString]);
    }
  }

  serialize() {
    let data: any = { history: {} };
    let now = moment().startOf("day");

    for (let i = 0; i < 7; i++) {
      let day = now.subtract(i, "days");
      let dayString = day.format(dayFormat);

      let duration = this.getDayDuration(day);

      if (duration)
        data.history[dayString] = duration;
    }

    return data;
  }

  getStreak(threshold=0) {
    let day = moment().startOf("day");

    let streak = 0;
    while(streak < 1000) {
      day = day.add(1, "day");
      let duration = this.getDayDuration(day);

      if ((duration === undefined) || (duration < threshold))
        break;

      streak += 1;
    }

    return streak;
  }

  getDuration(daysAgo=0) {
    let day = moment().startOf("day").subtract(daysAgo, "days");
    return this.getDayDuration(day) || 0;
  }

  getDayDuration(day: Moment) {
    let key = day.format(dayFormat);
    return this.history.get(key);
  }*/

  filterHistory(history: GritHistory) {
    return history.filter(e => e.action === this.key);
  }

  currentRate(history: GritHistory) {
    return this.nextRate(history, 0);
  }

  nextRate(history: GritHistory, off=1) {
    let mins = this.currentDuration(history);
    let hour = Math.floor(mins / 60);
    let currentRate = this.rate.eval(hour + off);
    return currentRate;
  }

  currentStreak(history: GritHistory, threshold=0, max=14) {
    return this.filterHistory(history).currentStreakLength(threshold, max);
  }

  continuedStreak(history: GritHistory, threshold=0, max=14) {
    return this.filterHistory(history).continuedStreakLength(threshold, max);
  }

  timeToNextRate(history: GritHistory) {
    let mins = this.filterHistory(history).durationToday();
    return 60 - (mins % 60);
  }

  currentDuration(history: GritHistory) {
    let mins = this.filterHistory(history).durationToday();
    //console.log(this.key, mins, history);
    return mins;
  }

  scheduleDetails(history: GritHistory) {
    let details = [];
    let currentDuration = this.currentDuration(history);

    for (let schedule of this.schedules) {
      let streak = this.continuedStreak(history, schedule.delay);
      let currentAmount = schedule.eval(streak);
      let nextAmount = schedule.eval(streak + 1);
      let timeToReward = schedule.delay - currentDuration;
      let hit = timeToReward == 0;

      details.push({
        streak,
        schedule,
        currentAmount,
        nextAmount,
        timeToReward,
        hit
      });
    }

    return details;
  }
}

let actionList = [
  new Action("Obsidian", new Rate(5, 2, 9), [new Schedule(100, 50, 350), new Schedule(100, 50, 250, 60)]),
  new Action("Exercise", new Rate(7, 0, 7), [new Schedule(100, 50, 250), new Schedule(50, 0, 50, 30)]),
  //new Action("Grit", new Rate(3, 0, 3), []),
  new Action("YouTube", new Rate(-6, -2, -8), [new Schedule(-50, -50, -300), new Schedule(-100, -150, -400, 120)]),
  //new Action("Twitch", new Rate(-4, -1, -8), []),
  new Action("Games", new Rate(-4, -2, -10), []),
  new Action("Writing", new Rate(2, 0, 2), []),
  new Action("Cleaning & Maintenance", new Rate(4, 0, 4), [new Schedule(200, -50, 100)]),
  new Action("Applications", new Rate(6, 1, 7), [new Schedule(200, 0, 200)]),
  new Action("VR", new Rate(-2, 0, -2), [])
];

let actionMap = new Map<string, Action>();
for (let action of actionList)
  actionMap.set(action.key, action);

export default actionMap;
