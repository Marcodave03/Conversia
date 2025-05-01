import db from "../config/Database.js";
import User from "./User.js";
import Avatar from "./Avatar.js";
import Background from "./Background.js";

User.hasMany(Avatar, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});

Avatar.belongsTo(User, {
  foreignKey: "user_id",
});

User.hasMany(Background, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
})

Background.belongsTo(User, {
  foreignKey: "user_id",  
})

db.sync({ alter: false })
export { User, Avatar };