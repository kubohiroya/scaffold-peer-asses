import {ReviewConfig} from './reviewConfig';
import {Reviewee, Reviewer, ReviewUser} from './ReviewUser';
import {RevieweeUserGroup} from './RevieweeUserGroup';
import shuffle from 'shuffle-array';
import {ReviewAssignments} from './ReviewAssignments';
import {createReviewUser, userEmailAddressCompare} from './createReviewUsers';
import Sheet = GoogleAppsScript.Spreadsheet.Sheet;

const AVAILABLE = 0;
const ASSIGNED = 1;
const PROHIBITED = -1;

export function createAssignedReviews(config: ReviewConfig, reviewers: Array<ReviewUser>, reviewees: Array<ReviewUser|RevieweeUserGroup>): ReviewAssignments{
  return createRandomizedReviewAssignments(config, reviewers, reviewees as Array<RevieweeUserGroup>);
}

function createInitialMatrix(config: ReviewConfig, reviewers: Array<ReviewUser>, reviewees: Array<ReviewUser|RevieweeUserGroup>, reviewThemselves: boolean): Array<Array<number>>{
  if(config.revieweeSrcType === "group"){
    return (reviewees as Array<RevieweeUserGroup>).map((reviewee, y)=> {
      const memberEmailAddresses = reviewee.members ? reviewee.members.map(member => member.emailAddress) : [];
      return reviewers.map((reviewer, x) => {
        return memberEmailAddresses.includes(reviewer.emailAddress) ? (reviewThemselves ? ASSIGNED : PROHIBITED) : AVAILABLE
      });
    });
  }else{
    return (reviewees as Array<Reviewee>).map((reviewee, y)=> {
      return reviewers.map((reviewer, x) => {
        return reviewee.emailAddress === reviewer.emailAddress ? (reviewThemselves ? ASSIGNED : PROHIBITED) : (config.binding==="all"||config.binding==="full" ? ASSIGNED : AVAILABLE);
      });
    });
  }
}

function countNumAvailable(matrix:Array<Array<number>>, reviewers: Array<ReviewUser>, reviewees: Array<ReviewUser|RevieweeUserGroup>){
  const numAvailableList =new Array(reviewers.length).fill(0);
  reviewers.forEach((reviewer, x)=>{
    reviewees.forEach((reviewee, y)=>{
      (matrix[y][x] === AVAILABLE) && numAvailableList[x]++;
    })
  })
  return {numAvailableList};
}

function createReviewAssignments(reviewers: Array<ReviewUser>, reviewees: Array<ReviewUser|RevieweeUserGroup>, matrix: Array<Array<number>>): ReviewAssignments{
  // Logger.log(JSON.stringify(matrix, null,' '));
  return {
    assignedReviewers: reviewers.map((reviewer, x)=>({reviewer, reviewees: reviewees.filter((reviewee, y)=>matrix[y][x]===ASSIGNED)})),
    assignedReviewees: reviewees.map((reviewee, y)=>({reviewee, reviewers: reviewers.filter((reviewer, x)=>matrix[y][x]===ASSIGNED)})),
    matrix,
  }
}

function createRandomizedReviewAssignments(config: ReviewConfig, reviewers: Array<ReviewUser>, reviewees: Array<ReviewUser|RevieweeUserGroup>): ReviewAssignments{
  const {numReviewRequired, reviewThemselves} = config;

  const matrix: Array<Array<number>> = createInitialMatrix(config, reviewers, reviewees, reviewThemselves);
  const {numAvailableList} = countNumAvailable(matrix, reviewers, reviewees);

  for(let n = 0; n < numReviewRequired; n++){
    reviewees.forEach((reviewee, y)=>{
      let candidateReviewers = [] as Array<Reviewer>;
      let maxNumAvailable = -1;
      reviewers.forEach((reviewer: Reviewer)=>{
        const numAvailable = numAvailableList[reviewer.index];
        if(maxNumAvailable < numAvailable){
          candidateReviewers = [reviewer];
          maxNumAvailable = Math.max(maxNumAvailable, numAvailable);
        }else if(maxNumAvailable == numAvailable){
          candidateReviewers.push(reviewer);
        }
      });

      const assignedReviewer = shuffle<Reviewer>(candidateReviewers)[0];
      matrix[y][assignedReviewer.index] = ASSIGNED;
      numAvailableList[assignedReviewer.index]--;
    })
  }

  return createReviewAssignments(reviewers, reviewees, matrix);
}

export function importReviewAssignmentsFromSheet(config: ReviewConfig, reviewers: Array<ReviewUser>, sheet: Sheet, startRow: number): ReviewAssignments{
  const {reviewThemselves} = config;
  const range = sheet.getRange(startRow, 1, sheet.getLastRow() - startRow + 1, 10);
  const values = range.getValues();
  const revieweeMap = new Map<string, Reviewee>();
  const assignedReviews = new Array<Array<number>>();

  let mode = 'header';
  values.forEach(row=>{
    if(mode === "header" && row[0] === ""){ // skip header lines and separator empty line
      mode = "body";
      return;
    }
    const reviewee = createReviewUser(
      {
        index: parseInt(row[0]) - 1,
        emailAddress: row[1] as string,
        fullName: row[2] as string,
        photoUrl: row[3] as string,
        // hashDigest: row[4] as string,
        nonce: config.nonce
      });

    const reviewerIndex = parseInt(row[5]) - 1;

    revieweeMap.set(reviewee.emailAddress, reviewee);
    assignedReviews.push([reviewee.index, reviewerIndex]);
  });

  Logger.log("assignedReviews * "+JSON.stringify(assignedReviews));

  const reviewees = Object.values(revieweeMap);
  const matrix: Array<Array<number>> = createInitialMatrix(config, reviewers, reviewees, reviewThemselves);

  Logger.log("matrix # "+JSON.stringify(matrix));

  assignedReviews.forEach(([revieweeIndex, reviewerIndex])=>{
    matrix[revieweeIndex][reviewerIndex] = ASSIGNED;
  });

  return createReviewAssignments(reviewers, reviewees, matrix);
}

export function storeReviewAssignmentsToSheet(config: ReviewConfig, reviews: ReviewAssignments, sheet: Sheet, startRow: number){
  const values = new Array<Array<string|number|boolean|null>>();
  reviews.assignedReviewers.forEach((assignedReviewer)=>{
    const {index, emailAddress, fullName, photoUrl, hashDigest} = assignedReviewer.reviewer;
    assignedReviewer.reviewees.forEach(reviewee=>{
      if(config.revieweeSrcType == "group"){
        const members = (reviewee as RevieweeUserGroup).members.sort(userEmailAddressCompare);
        const emailAddressList = members.map(m=>m.emailAddress).join("\t");
        const fullNameList = members.map(m=>m.fullName).join("\t");
        const photoUrlList = members.map(m=>m.photoUrl).join("\t");
        values.push([
          index+1, emailAddress, fullName, photoUrl, hashDigest,
          reviewee.index+1, emailAddressList, fullNameList, photoUrlList, reviewee.hashDigest]);
      }else{
        const r = reviewee as ReviewUser;
        values.push([
          index+1, emailAddress, fullName, photoUrl, hashDigest,
          reviewee.index+1, r.emailAddress, r.fullName, r.photoUrl, r.hashDigest]);
      }
    });
  });

  if(sheet.getLastRow() - startRow + 1 > 0){
    sheet.getRange(startRow, 1, sheet.getLastRow() - startRow + 1, 10).clear();
  }

  if(values.length > 0){
    const range = sheet.getRange(startRow, 1, values.length, 10);
    range.setValues(values);
  }
}
