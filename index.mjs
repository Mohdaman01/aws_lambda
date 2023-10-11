import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING);

function addMonths(date, months) {
    
  date.setMonth(date.getMonth() + months);

  return date;
}

export const handler = async (event) => {
    
    try{
        
        const db = await client.db("test");
    
        const feeheads = await db.collection("feeheads").find().toArray();
        
        const payments = await db.collection("payments").find().toArray();
        
        const students = await db.collection("students").find().toArray();
        
        const dues = [];
         
        feeheads.forEach((feehead) =>{
            const date = addMonths(feehead.start_date, feehead.frequency_months);
            dues.push(date.toString());
        });
        
        let defaultersID = [];
        
        for(let i=0 ;i<dues.length ; i++) {
        
            for(let i=0; i<payments.length; i++) {
                
                let dueDate = new Date(payments[i].due_date);
                dueDate = dueDate.toString();
            
                if(dues[i]  >  dueDate){
                    defaultersID.push(payments[i].student);
                    break;
                }
            }
        }
        
        defaultersID =  [...new Set(defaultersID)] 
        
        
        const body = {
            defaultersIDs: defaultersID
        };
        
        const response = {
            statusCode: 200,
            body
        };
        
        return response;    
        
    }catch(error){
        return {
            statusCode: 500,
            message: "internal sever error!"
        }
    }
    
};