// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Achievement, UserdataAchievement, Userdata } = initSchema(schema);

export {
  Achievement,
  UserdataAchievement,
  Userdata
};