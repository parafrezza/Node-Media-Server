const os = require('os');
function p()
{
     return (os.platform()=="win32") ? "\\" : "/"

}
console.log(p());