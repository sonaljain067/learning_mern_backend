
const isValidEmail = (email) => {
    const emailParts = email.split('@')
    if(emailParts.length != 2) {
        return false 
    }

    if(!emailParts[1].includes('.')) {
        return false 
    }
    return true 
}

export { isValidEmail }
