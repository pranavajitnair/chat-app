const socket=io()
const messages=document.querySelector('#message-template').innerHTML;
const $message=document.querySelector('#messages');
socket.on('messag',(value)=>{
      console.log(value); 
      const html=Mustache.render(messages,{
          username:value.username,
          message:value.text,
          created:moment(value.createdAt).format('h:mm a')
      })
      $message.insertAdjacentHTML('beforeend',html)
}) 
socket.on('message',(value)=>{
    console.log(value);
})
const autoscroll=()=>{
    const $new=$message.lastElementChild;
    const newMessageStyles=getComputedStyle($new);
    const newMessageMargin=parseInt(newMessageStyles.marginBottom);
    const newMessageHeight=$new.offsetHeight+newMessageMargin;
    const visibleHeight=$message.offsetHeight;
    const containerHeight=$message.scrollHeight;
    const scrollOffset=$message.scrollTop+visibleHeight;
    if(containerHeight-newMessageHeight<=scrollOffset){
        $message.scrollTop=$message.scrollHeight;
    }

}
socket.on('location',(link)=>{
    const loc=document.querySelector('#location-template').innerHTML;
    const html=Mustache.render(loc,{
        username:link.username,
        url:link.text,
        created:moment(link.createdAt).format('h:mm a')
    })
    $message.insertAdjacentHTML('beforeend',html)
})
document.querySelector('#b2').addEventListener('click',()=>{
    const val=document.querySelector('#input').value;
    document.querySelector('#input').value='';
    socket.emit('nice',val,(error)=>{
        if(error)  return console.log('such words are not allowed!');
    });
    autoscroll();
})
document.querySelector('#b3').addEventListener('click',()=>{
    if(!navigator.geolocation) return alert('Geolocation is not supported');
   navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('nice_two',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        })
    })
    autoscroll();
})
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})
if(!username||!room) {
    console.log('cannot join');
    location.href='/'
    alert('username has been aldredy be taken')

}
else{console.log(location.search,username)
socket.emit('join',{username,room});
}
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML;
socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html;
})
