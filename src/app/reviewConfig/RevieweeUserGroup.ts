import {ReviewUser} from './ReviewUser';

export interface RevieweeUserGroup {
  index: number;
  hashDigest: string;
  members: Array<ReviewUser>;
}
