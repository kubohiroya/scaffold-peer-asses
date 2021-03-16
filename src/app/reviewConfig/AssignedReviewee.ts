import {Reviewee, Reviewer} from './ReviewUser';
import {RevieweeUserGroup} from './RevieweeUserGroup';

export interface AssignedReviewee {
  reviewee: Reviewee|RevieweeUserGroup;
  reviewers: Array<Reviewer>;
}
