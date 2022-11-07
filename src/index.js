const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded())

const users = [];


function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const userNameExists = users.find((user) => user.username === username)
  if (!userNameExists) {
    return response.status(404).json({ error: "No exists userName" })
  }
  request.userNameExists = userNameExists
  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const createdUsers = users.find((user) => user.username === username)

  if (createdUsers) {
    return response.status(400).json({ error: "UserName already exists!" })
  }
  const user = {
    id: uuidv4(),
    username,
    name,
    todos: []
  }
  users.push(user)
  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { userNameExists } = request
  return response.json(userNameExists.todos)

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { userNameExists } = request
  const { title, deadline } = request.body
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  userNameExists.todos.push(todo)
  return response.status(201).json(todo)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { userNameExists } = request
  const { title, deadline } = request.body
  const { id } = request.params

  const checkTodo = userNameExists.todos.find(todo => todo.id === id)
  if (!checkTodo) {
    return response.status(404).json({ error: 'todo not found' })
  }

  checkTodo.title = title
  checkTodo.deadline = new Date(deadline)
  return response.json(checkTodo)


});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { userNameExists } = request
  const { id } = request.params
  const checkTodo = userNameExists.todos.find(todo => todo.id === id)
  if (!checkTodo) {
    return response.status(404).json({ error: 'todo not found' })
  }
  checkTodo.done = true
  return response.json(checkTodo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { userNameExists } = request
  const { id } = request.params

  const todoIndex = userNameExists.todos.findIndex(todo => todo.id === id)
  if (todoIndex == -1) {
    return response.status(404).json({ error: 'Todo not found' })
  }
  userNameExists.todos.splice(todoIndex, 1)
  return response.status(204).send()

});

module.exports = app;