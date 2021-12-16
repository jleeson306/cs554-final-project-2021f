const mongoCollections = require('../config/mongoCollections');
const battles = mongoCollections.battleCollection;
const users = mongoCollections.usersCollection;
const {ObjectId} = require('mongodb');
const { battleCollection } = require('../config/mongoCollections');
const { usersCollection } = require('../config/mongoCollections');
const popularityData = require('./popularity');
const userData = require('./user');
const timePerBattle = 60000;//in milliseconds 

const removeAll = async function() {
	const battleCollection = await battles();
	battleCollection.deleteMany({});
	return({code: 200, message: "removeAll: successfully nuked battles database"});
}

const createBattle = async function(trainerOne, trainerTwo, pokemonOne, pokemonTwo) {
	if(arguments.length != 4 || trainerOne == undefined || trainerTwo == undefined || pokemonOne == undefined || pokemonTwo == undefined) {
		throw({code: 400, message: "createBattle: you are missing one of trainerOne, trainerTwo, pokemonOne, pokemonTwo, winner"});
	}
	if(typeof trainerOne !== 'string' || trainerOne.trim() == "") {
		throw({code: 400, message: "createBattle: trainerOne must be a string that isn't empty or just spaces"});
	}
    if(typeof trainerTwo !== 'string' || trainerTwo.trim() == "") {
		throw({code: 400, message: "createBattle: trainerTwo must be a string that isn't empty or just spaces"});
	}
    if(typeof pokemonOne !== 'string' || pokemonOne.trim() == "") {
		throw({code: 400, message: "createBattle: pokemonOne must be a string that isn't empty or just spaces"});
	}
    if(typeof pokemonTwo !== 'string' || pokemonTwo.trim() == "") {
		throw({code: 400, message: "createBattle: pokemonTwo must be a string that isn't empty or just spaces"});
	}

    pokemonOne = pokemonOne.toLowerCase();
    pokemonTwo = pokemonTwo.toLowerCase();

    let winner = trainerOne;
    let pokemonOnePop = await popularityData.getPokemonPopularity(pokemonOne);
    let pokemonTwoPop = await popularityData.getPokemonPopularity(pokemonTwo);

    if(pokemonTwoPop > pokemonOnePop) {
        winner = trainerTwo;
    }
	
	const battleCollection = await battles();
    const nowDate = new Date().getTime();
	
	let newBattle = {
		trainerOne: trainerOne,
        trainerTwo: trainerTwo,
        pokemonOne: pokemonOne,
        pokemonTwo: pokemonTwo,
        winner: winner, 
        battleBets: [],
        payoutGiven: false,
        timeStamp: (nowDate+timePerBattle)
	};
	
	const inIn = await battleCollection.insertOne(newBattle);

	if(inIn.insertCount === 0) {
		throw({code: 500, message: "createBattle: unable to add that battle"});
	}
	else{
        let newBattleID = await inIn.insertedId.toString();
        newBattle._id = newBattleID;
        newBattle.winner = "To Be Determined";
		return newBattle;
	}
}

const getBattle = async function(battleID) {
	if(arguments.length != 1 || battleID == undefined) {
		throw({code: 400, message: "getBattle: you are missing a battleID"});
	}
	else if (typeof battleID === 'string') {
		battleID = ObjectId(battleID);
	}
	else {
		throw({code: 400, message: "getBattle: battleID must be a string'"});
	}

    if(battleID instanceof ObjectId) {
        const battleCollection = await battles();

        const battle = await battleCollection.findOne({_id: battleID});

        if(battle == null) {
            throw({code: 404, message: "getBattle: a battle with that ID does not exist"});
        }
        else{
            const nowDate = new Date().getTime();
            if(nowDate <= battle.timeStamp){
                battle.winner = "To Be Determined";
            }
            return battle;
        }
    }
    else {
        throw({code: 400, message: "getBattle: battleID must be a valid ObjectID'"});
    }
}

const getCurrentBattles = async function() {
    const battleCollection = await battles();
    const nowDate = new Date().getTime();
    const battles = await battleCollection.find({timeStamp: {$gt: nowDate} }).toArray();

    battles.forEach(element => {
        element.winner = "To Be Determined";
    });

    return battles;
}

const createBet = async function(userName, betAmount, battleID, predectedWinner) {
	if(arguments.length != 4 || battleID == undefined || userName == undefined || betAmount == undefined || predectedWinner == undefined) {
		throw({code: 400, message: "createBet: you are missing one of userName, betAmount, predectedWinner, or battleID"});
	}
    if(typeof userName !== 'string' || userName.trim() == "") {
		throw({code: 400, message: "createBet: userName must be a string that isn't empty or just spaces"});
	}
    if(typeof predectedWinner !== 'string' || userName.trim() == "") {
		throw({code: 400, message: "createBet: predectedWinner must be a string that isn't empty or just spaces"});
	}
	if(typeof betAmount !== 'number' || betAmount == 1) {
		throw({code: 400, message: "createBet: betAmount must be a number that isn't zero"});
	}
	else if (typeof battleID === 'string') {
		battleID = ObjectId(battleID);
	}
	else {
		throw({code: 400, message: "createBet: battleID must be a string'"});
	}

    if(battleID instanceof ObjectId) {
        const usersCollection = await users();
        const user = await usersCollection.findOne({userName: userName});
        if(user == null) {
            throw({code: 404, message: "createBet: a user with that display name does not exist"});
        }
        const battleCollection = await battles();
        const battle = await battleCollection.findOne({_id: battleID});
        if(battle == null) {
            throw({code: 404, message: "createBet: a battle with that ID does not exist"});
        }

        if(user.wallet < betAmount) {
            betAmount = user.wallet;
        }
        await userData.changeFunds(userName, (betAmount * -1))

        newBet = {
            userName: userName,
            predectedWinner: predectedWinner,
            payout: (betAmount * 2)
        }
        const upin = await battleCollection.updateOne({_id: battleID}, {$push: {battleBets: newBet }});
        if (upin === 0) {
            throw({code: 500, message: "createBet: unable to add that bet to the database"});
        }
        else{
            return({code: 200, message: "createBet: bet successfully added"});
        } 
    }
    else {
        throw({code: 400, message: "createBet: battleID must be a valid ObjectID'"});
    }
}

const payoutAllBattles = async function() {
    const battleCollection = await battles();
    const nowDate = new Date().getTime();
    const battles = await battleCollection.find({timeStamp: {$lt: nowDate} }).toArray();

    battles.forEach(element => {
        if(element.payoutGiven) {
            await battleCollection.deleteOne({_id: element._id});
        }
        else{
            element.battleBets.forEach(subElement => {
                if(subElement.predectedWinner == element.winner) {
                    await userData.changeFunds(subElement.userName, subElement.payout)
                }
            });
            await battleCollection.updateOne({_id: element._id}, {$set: {payoutGiven: true}});
        }
    });

    return "wow I hated writing this, even though it is so small";
}

module.exports = {
	removeAll,
    createBattle,
    getBattle,
    getCurrentBattles,
    createBet,
    payoutAllBattles
}