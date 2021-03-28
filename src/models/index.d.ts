import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";





export declare class Achievement {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly value: number;
  readonly achieved_by?: (UserdataAchievement | null)[];
  readonly target: string;
  constructor(init: ModelInit<Achievement>);
  static copyOf(source: Achievement, mutator: (draft: MutableModel<Achievement>) => MutableModel<Achievement> | void): Achievement;
}

export declare class UserdataAchievement {
  readonly id: string;
  readonly userdata: Userdata;
  readonly achievement: Achievement;
  constructor(init: ModelInit<UserdataAchievement>);
  static copyOf(source: UserdataAchievement, mutator: (draft: MutableModel<UserdataAchievement>) => MutableModel<UserdataAchievement> | void): UserdataAchievement;
}

export declare class Userdata {
  readonly id: string;
  readonly username: string;
  readonly highscore: number;
  readonly games_played: number;
  readonly achievements?: (UserdataAchievement | null)[];
  readonly stars_collected: number;
  constructor(init: ModelInit<Userdata>);
  static copyOf(source: Userdata, mutator: (draft: MutableModel<Userdata>) => MutableModel<Userdata> | void): Userdata;
}