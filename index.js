const dotenv = require('dotenv');
const express = require('express');
const http = require('http'); // Import http module
const socketIo = require('socket.io');

dotenv.config();
const PORT = process.env.PORT || 8900;
const app = express();
const server = http.createServer(app); // Create HTTP server
const io = socketIo(server, {
  cors: {
    origin: '*'
  }
});

let users = [];
app.get('/', (req, res) => {
  res.send('Hello World!');
})
io.on('connection',(socket)=>{
  
    socket.on('add-user',(newUserId)=>{
      console.log(newUserId,'user to be added');
      if(!users.some(user=>user.id === newUserId)){
        users.push({id:newUserId,socketId:socket.id})
      }
      io.emit('get-users',users);
    })
    // socket.on('user_connected',(id)=>{
    //   if(!users.some(user=>user.id === newUserId)){
    //     users.push({id:newUserId,socketId:socket.id})
    //   }
    //   io.emit('connected_users',users)
    // })
    socket.on('send-message',(data)=>{
  if(data){
    const{receiverId} = data;
    console.log(users);
    const user = users.find(user=>user.id === receiverId)
    if(user){
      console.log(user);
      io.to(user.socketId).emit('receive-message',data)
    }
  }
    })
    socket.on('sending-new-post',(newPost)=>{
      io.emit('receiving-new-post', newPost);
    })
    socket.on('sending-likings',(likes)=>{
      console.log(likes,"this is sending likes");
       io.emit(`notifying-likings-${likes.postId}`,{postId:likes.postId})
    })
    socket.on('update-liked',(data)=>{
      io.to(data.socketId).emit(`receiving-liked-${data.postId}`, data.liked)
    })
    socket.on('sending-new-comment',(newComment)=>{
      io.emit(`receiving-new-comment${newComment.postId}`,newComment.newComment)
    })
    socket.on('delete-Post',(postId)=>{
      console.log(postId, "this is post id");
      io.emit('deleted-post',postId);
    })
    socket.on('notifying-friend-request',(friendId)=>{
      io.emit(`receiving-friend-request-${friendId}`)
    })
    socket.on('notifying-accepting-request',(friendId)=>{
      io.emit(`receiving-accepting-request-${friendId}`)
    })
    socket.on('notifying-unfriend',(friendId)=>{
      io.emit(`receiving-unfriend-${friendId}`)
    })
    socket.on('notifying-declining-request',(friendId)=>{
      io.emit(`receiving-declining-request-${friendId}`)
    })
    socket.on('disconnect',()=>{
      console.log("disconnected");
     users = users.filter(user=>user.socketId !==socket.id)
     io.emit('get-users',users)
    })
})
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});