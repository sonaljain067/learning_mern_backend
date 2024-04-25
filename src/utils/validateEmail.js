
const isValidEmail = (email) => {
    const emailParts = email.split('@')
    if(emailParts.length != 2) {
        return false 
    } 
    const localPart = emailParts[0]
    const domain = emailParts[1]

    if((!localPart.includes('.') && !localPart.includes('_')) || (!domain.includes('.'))) {
        return false 
    }
    return true 
}

export { isValidEmail }
