export const localhost: string = 'http://localhost';

export const environments = {
    apiUrl: localhost.concat(':8090/api/'), //api gateway
    authUrl: localhost.concat(':9000/api/login'), //login
    apiUsuarios: localhost.concat(':9000/admin/usuarios') //gestion de usuarios
}