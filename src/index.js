const express=require('express');
const {addUser,removeUser,getUser,getUserRoom}=require('./utils/users');
const path=require('path');
const http=require('http');
const Filter=require('bad-words');
const {generateMessage}=require('./utils/messages');
const socketio=require('socket.io');
const app=express();
const server=http.createServer(app);
//the above step happens anyway
const io=socketio(server)
//socket requires the raw socket
const pathforpublic=path.join(__dirname,'../public');
app.use(express.static( pathforpublic))
let count=0;
io.on('connection',(socket)=>{
   console.log('new server');
   socket.on('nice',(value,callback)=>{
      const user=getUser(socket.id)
      const filter=new Filter();
      if(filter.isProfane(value)) return callback(1);
      io.to(user.room).emit('messag',generateMessage(value,user.username));
      socket.emit('message','Delivered!');
   })
   socket.on('nice_two',(value)=>{
      const user=getUser(socket.id);
      const mess='https://google.com/maps?q='+value.latitude+','+value.longitude;
      //console.log(mess);
      socket.broadcast.emit('location',generateMessage(mess,user.username));
      socket.emit('message','Shared!')
   })
   socket.on('disconnect',()=>{
      const user=removeUser(socket.id);
      if(user){
      io.to(user.room).emit('message',user.username+' has left');
      io.to(room).emit('roomData',{
         room:user.room,
         user:getUserRoom(user.room)  
      })
   }
   }) 
   socket.on('join',({username,room})=>{
      const {error,user}=addUser({id:socket.id,username,room});
      socket.join(room)
      socket.emit('message','Welcome!')
      socket.broadcast.to(room).emit('message',username+' has just joined');
      io.to(user.room).emit('roomData',{
         room:user.room,
         users:getUserRoom(user.room)
      })
   })
})
server.listen(3000,()=>{
   console.log( 'listining on port 3000');
})