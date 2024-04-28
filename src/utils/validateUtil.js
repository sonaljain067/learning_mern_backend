
const isValidEmail = (email) => {
    return email.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/); 
}

const isValidPhoneNumber = ( phoneNumber ) => {
    var regEx = new RegExp('^([0|\+[0-9]{1,5})?([7-9][0-9]{9})$')
    return regEx.test(phoneNumber)
}
export { isValidEmail, isValidPhoneNumber }