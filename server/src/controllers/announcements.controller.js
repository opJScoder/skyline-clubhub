import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { q, tx, one } from '../db/pool.js';
import { FEE, DISC, SEC } from '../config/env.js';
import { h, E, pub, tok, STAFF } from '../utils/helpers.js';

export const getAnnouncements = h(async (_, res) => res.json(await q('select a.*,u.name author from announcements a left join users u on u.id=a.author_id order by pinned desc,created_at desc')));

export const postAnnouncements = h(async (req, res) => { const b = req.body; res.json((await q('insert into announcements(title,body,category,pinned,author_id) values($1,$2,$3,$4,$5) returning *', [b.title, b.body, b.category || 'general', !!b.pinned, req.u.id]))[0]) });

export const putAnnouncementsId = h(async (req, res) => { const b = req.body; res.json((await q('update announcements set title=$1,body=$2,category=$3,pinned=$4 where id=$5 returning *', [b.title, b.body, b.category, !!b.pinned, req.params.id]))[0]) });

export const deleteAnnouncementsId = h(async (req, res) => { await q('delete from announcements where id=$1', [req.params.id]); res.json({ ok: 1 }) });
