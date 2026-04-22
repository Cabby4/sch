
const logger = (req, res, next ) => {
    
    const timefound = new Date ().toISOString()
    console.log(`${timefound} - ${req.method} - ${req.url} from ${req.ip}`);
    
    next();
}

module.exports = logger;