import {AssignedReviewer} from './AssignedReviewer';
import {AssignedReviewee} from './AssignedReviewee';

export interface ReviewAssignments {
  assignedReviewers: Array<AssignedReviewer>;
  assignedReviewees: Array<AssignedReviewee>;
  matrix: Array<Array<number>>;

}
