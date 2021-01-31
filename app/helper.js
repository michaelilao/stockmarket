export const isBodyExist = (req) => {
    if(!req.body) {
        return false
    }
    return true
}