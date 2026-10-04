import fs from "fs";
import bcrypt from "bcryptjs";
import { pool, q } from "./pool.js";

export async function initDb() {
  await pool.query(
    fs.readFileSync(new URL("./schema.sql", import.meta.url), "utf8"),
  );
  if (!(await q("select 1 from users limit 1")).length) {
    const pw = await bcrypt.hash("password123", 10),
      d = (n) => new Date(Date.now() + n * 864e5);
    await q(
      "insert into users(name,email,password,role) values('Club Admin','admin@skyline.edu',$1,'admin'),('Tara Treasurer','treasurer@skyline.edu',$1,'treasurer'),('Sam Student','user@skyline.edu',$1,'user')",
      [pw],
    );
    await q(
      "insert into events(title,description,venue,starts_at,capacity,price,member_price) values('Spring Gala','Our biggest night of the year – music, food and dancing.','Skyline Auditorium',$1,150,500,300),('Open Mic Night','Bring a song, a poem or just your ears.','Student Lounge',$2,60,100,0)",
      [d(21), d(7)],
    );
    await q(
      "insert into announcements(title,body,category,pinned) values('Welcome to Skyline ClubHub','Join as a member to get cheaper tickets and 10% off merch. Next general meeting: Friday 5 PM, Room 204.','meeting',true)",
    );
    await q(
      "insert into products(name,description,price,image,sizes) values('Skyline Hoodie','Heavy fleece, embroidered logo.',1200,'/hoodie.webp','{\"S\":10,\"M\":15,\"L\":12,\"XL\":6}'),('Club T-Shirt','Soft cotton tee.',500,'/shirt.avif','{\"S\":20,\"M\":25,\"L\":20,\"XL\":10}')",
    );
    await q(
      "insert into fundraisers(title,goal,event_date) values('Spring Bake Sale',15000,$1)",
      [d(14)],
    );
  }
}
