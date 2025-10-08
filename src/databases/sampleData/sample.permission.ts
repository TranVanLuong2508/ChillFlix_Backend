export const INIT_PERMISSIONS = [
  // Users Controller
  {
    name: 'Create User',
    apiPath: '/api/v1/users',
    method: 'POST',
    module: 'USERS',
  },
  {
    name: 'Get Users with Pagination',
    apiPath: '/api/v1/users/get-user-with-pagination',
    method: 'GET',
    module: 'USERS',
  },
  {
    name: 'Get All Users',
    apiPath: '/api/v1/users',
    method: 'GET',
    module: 'USERS',
  },
  {
    name: 'Get User by ID',
    apiPath: '/api/v1/users/:id',
    method: 'GET',
    module: 'USERS',
  },
  {
    name: 'Update User',
    apiPath: '/api/v1/users/update',
    method: 'PATCH',
    module: 'USERS',
  },
  {
    name: 'Delete User',
    apiPath: '/api/v1/users/:id',
    method: 'DELETE',
    module: 'USERS',
  },

  // All Codes Controller
  {
    name: 'Create All Code',
    apiPath: '/api/v1/all-codes',
    method: 'POST',
    module: 'ALL-CODES',
  },
  {
    name: 'Get All Codes',
    apiPath: '/api/v1/all-codes',
    method: 'GET',
    module: 'ALL-CODES',
  },
  {
    name: 'Get Code by ID',
    apiPath: '/api/v1/all-codes/:id',
    method: 'GET',
    module: 'ALL-CODES',
  },
  {
    name: 'Update All Code',
    apiPath: '/api/v1/all-codes/:id',
    method: 'PATCH',
    module: 'ALL-CODES',
  },
  {
    name: 'Delete All Code',
    apiPath: '/api/v1/all-codes/:id',
    method: 'DELETE',
    module: 'ALL-CODES',
  },
];
