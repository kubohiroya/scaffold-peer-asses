import {Reviewee, Reviewer} from './ReviewUser';
import {RevieweeUserGroup} from './RevieweeUserGroup';

export interface AssignedReviewer {
  reviewer: Reviewer;
  reviewees: Array<Reviewee|RevieweeUserGroup>;
}
