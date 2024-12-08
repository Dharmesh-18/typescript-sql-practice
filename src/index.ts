import express from "express";
import { Client } from "pg";
 
const app = express();

app.use(express.json());

const pgClient = new Client({
   connectionString: "postgresql://neondb_owner:rIC0WE8xYMVQ@ep-silent-tooth-a59315ky.us-east-2.aws.neon.tech/neondb?sslmode=require"
});
pgClient.connect();

app.post("/signup", async (req: any, res: any) => {

    try {
        
        const {name, role, city, state} = req.body;
    
        const addUserQuery = `INSERT INTO users (name, role) VALUES ($1, $2) RETURNING ROW_TO_JSON(users) AS user;`;
        const userResponse = await pgClient.query(addUserQuery, [name, role]);
        const userId = userResponse.rows[0].user.id;
        
        const addAddressQuery = `INSERT INTO address (city, state, user_id) VALUES ($1, $2, $3) RETURNING ROW_TO_JSON(address) AS address;`;
        const addressResponse = await pgClient.query(addAddressQuery, [city, state, userId]);


        console.log(userResponse.rows);
        console.log(addressResponse.rows);
    
        res.json({
            message: "User added successfully",
            user: userResponse.rows[0],
            address: addressResponse.rows[0]
        })
    } catch (error) {
        console.log(error);
    }
});

app.get("/fetchUsersData", async (req: any, res: any) => {

    try {
        
        const {userId} = req.query;
    
        const fetchUserDataQuery = `SELECT u.name, a.city, a.state FROM users u JOIN address a ON u.id = a.user_id WHERE u.id = $1`;

        const fetchedResponse = await pgClient.query(fetchUserDataQuery, [userId]);
        


        console.log(fetchedResponse.rows[0]);
    
        res.json({
            message: "User fetched successfully",
            user: fetchedResponse.rows[0]
        })
    } catch (error) {
        console.log(error);
    }
});

app.listen(3000);

