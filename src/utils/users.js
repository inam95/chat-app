const  users = [];

function addUser({id, username, room}) {
    // clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // validate data
    if(!username || !room) {
        return {
            error: 'Username and room are required'
        }
    }

    // check for existing user
    const isExistingUser = users.find((user) => {
        return user.room === room && user.username === username
    });

    // validate username
    if(isExistingUser) {
        return {
            error: 'Username is in use'
        }
    }

    // store user
    const user = {
        id, username, room
    }
    users.push(user)
    return {user}
}

function removeUser(id) {
    const index = users.findIndex((user) => user.id === id);
    if(index !== -1) {
        return users.splice(index, 1)[0];
    }
}

function getUser(id){
    return users.find((user) => user.id === id)
}

function getUsersInRoom(room) {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room == room)
}

export {addUser, removeUser, getUser, getUsersInRoom}