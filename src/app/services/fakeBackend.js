//  find: 2,
//  findone: 1,
//  create: 4,
//  update: 8,
//  destroy: 16,

const users = [
    { id: 1, username: 'admin', password: 'admin', firstName: 'Admin', lastName: 'User' },
    { id: 2, username: 'user', password: 'user', firstName: 'Normal', lastName: 'User' },
];

const tokens = [
    {
        id: 1,
        token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1ODgzNjEwNzYsImlhdCI6MTU4Nzc5MjI3NiwiaWQiOjQxNDMsInVzZXJuYW1lIjoiYWRtaW4iLCJwZXJtaXNzaW9ucyI6eyJuZXdzIjo3LCJjYXRlZ29yaWVzIjozLCJwcm9kdWN0cyI6IjYzIn0sImlzX2FkbWluIjp0cnVlLCJkZXZpY2VfaWQiOiI5NGY4ZTM4YS1mOTFmLTQ0MWYtYjAwYi00MmQ5ZGViZjIxZWIifQ.4GdQ25Wot6qpia0MVY6h00D54ked1HuQse8p483cegk',
    },
    {
        id: 2,
        token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1ODgzNjEwNzYsImlhdCI6MTU4Nzc5MjI3NiwiaWQiOjQxNDMsInVzZXJuYW1lIjoiYWRtaW4iLCJwZXJtaXNzaW9ucyI6eyJuZXdzIjo3LCJjYXRlZ29yaWVzIjozfSwiaXNfYWRtaW4iOnRydWUsImRldmljZV9pZCI6Ijk0ZjhlMzhhLWY5MWYtNDQxZi1iMDBiLTQyZDlkZWJmMjFlYiJ9.4SYSkT9FGf0itXksGdp1kMUzAo5jP5dDNOoZrTOZ4aI',
    },
];

const configFakeBackend = () => {
    const realFetch = window.fetch;
    window.fetch = (url, opts) => {
        const { method, headers } = opts;
        const body = opts.body && JSON.parse(opts.body);
        return new Promise((resolve, reject) => {
            setTimeout(handleRoute, 500);

            function handleRoute() {
                switch (true) {
                    case url.endsWith('/users/authenticate') && method === 'POST':
                        return authenticate();
                    case url.endsWith('/users/register') && method === 'POST':
                        return register();
                    case url.endsWith('/users') && method === 'GET':
                        return getUsers();
                    default:
                        return realFetch(url, opts)
                            .then(response => resolve(response))
                            .catch(error => reject(error));
                }
            }
            function authenticate() {
                const { username, password } = body;
                const user = users.find(x => x.username === username && x.password === password);
                if (!user) return error('Username or password is incorrect');
                return ok({
                    id: user.id,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    token: tokens[user.id].token,
                });
            }

            function register() {
                const user = body;

                if (users.find(x => x.username === user.username)) {
                    return error(`Username  ${user.username} is already taken`);
                }

                // assign user id and a few other properties then save
                user.id = users.length ? Math.max(...users.map(x => x.id)) + 1 : 1;
                users.push(user);
                localStorage.setItem('users', JSON.stringify(users));

                return ok();
            }

            function getUsers() {
                if (!isLoggedIn()) return unauthorized();

                return ok(users);
            }

            function isLoggedIn() {
                return headers.Authorization === 'Bearer fake-jwt-token';
            }

            function ok(body) {
                resolve({ ok: true, text: () => Promise.resolve(JSON.stringify({ data: body })) });
            }

            function unauthorized() {
                resolve({ status: 401, text: () => Promise.resolve(JSON.stringify({ message: 'Unauthorised' })) });
            }

            function error(message) {
                resolve({ status: 400, text: () => Promise.resolve(JSON.stringify({ message })) });
            }
        });
    };
};

export default configFakeBackend;
