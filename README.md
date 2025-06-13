# Team Uni


## Getting started

To set up the project, do these steps in terminal/CMD:

```
git clone https://df-git.informatik.uni-kl.de/teaching/df-project/ss25/team-uni.git
cd team-uni
git checkout <your_branch>
cd server
npm install
cd ..
cd client
npm install
```

To run the project, do these steps:
1st terminal:
```
cd team-uni
cd server
node index.js
```

2nd terminal:
```
cd team-uni
cd client
npm start
```

Then go to http://localhost:3000/


## API calls

To do API calls, first import this utility:
```
import api from "../utils/api";
```

Then send a request:

GET:
```
const response = await api.get('/api/...')
const result = await response.data;
```

POST:
```
const response = await api.post('/api/...', {...})
const result = await response.data;
```

PUT:
```
const response = await api.put('/api/...', {...})
const result = await response.data;
```

## Some APIs:

Moving Farmbot:
```
import api from "../utils/api";

const response = await api.post('http://localhost:5000/move, {x: 200, y: 500, z: 0})
const result = await response.data;
```