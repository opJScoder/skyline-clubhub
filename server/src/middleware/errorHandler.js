export const errorHandler=(e,_req,res,_next)=>{
  if(e.code==='23503'||e.code==='22P02')e.c=400;
  if(!e.c)console.error(e);
  res.status(e.c||500).json({error:e.c?e.message:'Something went wrong'});
};
