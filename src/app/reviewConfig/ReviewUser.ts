export interface ReviewUser{
  // '評価者通し番号','評価者メールアドレス','評価者氏名','評価者メールアドレスのハッシュ値'
  index: number,
  emailAddress: string,
  fullName: string,
  photoUrl: string,
  hashDigest: string,
}
export interface Reviewer extends ReviewUser{};
export interface Reviewee extends ReviewUser{};

