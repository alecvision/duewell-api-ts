import util from 'util'

const prettyPrintRes = (response) => {
    console.log(util.inspect(response.data, { colors: true, depth: 4 }));
};

export default prettyPrintRes;