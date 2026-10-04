export const inr=n=>'₹'+(+n||0).toLocaleString('en-IN');
export const dt=d=>new Date(d).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'});
export const dd=d=>new Date(d).toLocaleDateString('en-IN',{dateStyle:'medium'});
