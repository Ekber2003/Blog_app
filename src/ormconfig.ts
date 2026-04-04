import { DataSourceOptions } from "typeorm";
import { User } from "./users/entities/user.etity";
import { Post } from "./post/post.entity";
import { Comment } from "./comment/comment.entity";
import { Upload } from "./upload/upload.entity";
import { Reaction } from "./reaction/reaction.entity";

export const typeOrmConfig:DataSourceOptions ={
    type:"postgres",
    host:process.env.DB_HOST || 'localhost',
    port:Number(process.env.DB_PORT) || 5432,
    username:process.env.DB_USERNAME || "postgres",
    password:process.env.DB_PASSWORD || "123456",
    database:process.env.DB_NAME || "blog_db",
    entities:[User,Post,Comment,Upload,Reaction], //Entities will be added in the future
    synchronize:true,
    logging:false
}