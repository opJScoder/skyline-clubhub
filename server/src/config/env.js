import 'dotenv/config';
export const PORT=process.env.PORT||5000;
export const DATABASE_URL=process.env.DATABASE_URL;
export const SEC=process.env.JWT_SECRET||'dev';
export const FEE=+process.env.MEMBERSHIP_FEE||299;
export const DISC=+process.env.MEMBER_MERCH_DISCOUNT||10;
