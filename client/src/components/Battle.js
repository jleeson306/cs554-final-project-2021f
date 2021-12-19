import React, { useState, useEffect, useContext } from "react";
import PokeCard from './PokeCard';
import { useQuery, useMutation,  ApolloClient, HttpLink, InMemoryCache} from '@apollo/client';
import { Grid, makeStyles } from '@material-ui/core';
import queries from '../queries';
import mutations from '../mutations';
import { AuthContext } from "../firebase/AuthContext";

const useStyles = makeStyles({
    grid: {
      flexGrow: 1,
      flexDirection: 'row'
    }
  });

const Battle = () => {
    const classes = useStyles();
    const { currentUser }=useContext(AuthContext);
    const [ visibleData, setVisible ] = useState(false);
    const [ pokemon1, setPokemon ]=useState(0);
    //const [battleData, setBattleData] = useState(undefined);
    // Get the current User's username from firebase
    const { loading: load, error: err, data: portfolioData } = useQuery(queries.GET_PORTFOLIO, {
        fetchPolicy: "network-only",
        variables: { gid: currentUser.uid }
    })
    const { loading, error, data: userData } = useQuery(queries.GET_ALL_USERS, {
        fetchPolicy: "network-only"
    });
    console.log(loading);
    console.log(error);
    console.log(userData);
    console.log(portfolioData);
    let user2=null;
    let pokemon2=null;
    if(!loading){
        const random = Math.floor(Math.random()*userData.allUsers.length);
        console.log(userData.allUsers[random]);
        user2 = userData.allUsers[random];
        console.log(user2);
        const rand = Math.floor(Math.random()*user2.pokemonCollection.length);
        pokemon2 = user2.pokemonCollection[rand];
    }
    const [battle, {loading: l, error: e, data: battleData}]=useMutation(mutations.ADD_BATTLE);
    let card=null;

    console.log(battleData);
    console.log(l);
    console.log(e);

    const toggleVisible = () => {
        setVisible({
          visibleData: true
        })
      }

    if(!currentUser){
        return(
          <h2>A User Must Sign In Before They Can Start a Battle</h2>
        )
      }

    const theCard = (trainer, pokemons) => {
        setPokemon({
            pokemon1: pokemons[0]
        })
        battle({
          variables: {trainers: trainer, givenPokemon: pokemons}
        });
        toggleVisible();
      }

    const CardGrid = (pokemon) => {
        console.log(user2.userName);
        pokemon.pokemonID=pokemon.pokemonID.toString();
        pokemon2.pokemonID=pokemon2.pokemonID.toString();
        console.log(pokemon);
        console.log(pokemon2);
        let catchers = ["James", user2.userName];
        let poke1 = {pokemonID: pokemon.pokemonID, pokemonName: pokemon.pokemonName, imageLink: pokemon.imageLink, isShiny: pokemon.isShiny};
        let poke2 = {pokemonID: pokemon2.pokemonID, pokemonName: pokemon2.pokemonName, imageLink: pokemon2.imageLink, isShiny: pokemon2.isShiny}
        let p = [poke1, poke2];
        console.log(catchers);
        console.log(p);
        return(
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={pokemon.pokemonID}>
                <PokeCard pokemon={pokemon}></PokeCard>
                <button onClick={() => theCard(catchers,p)}>I Choose You!</button>
            </Grid>
        )
    }

    if(loading || load || l){
        return(
            <h2>Loading</h2>
        )
    }

    if(!load && !portfolioData){
        return(
            <h2>Cannot Start a battle without any pokemon</h2>
        )
    }

    if (!pokemon1 && portfolioData && userData){
        // Have user choose their pokemon
        card=
        portfolioData && userData &&
        portfolioData.portfolio.map((pokemon)=>{
            return CardGrid(pokemon)
        })
        console.log(battleData);
        return (
            <div>
            {!visibleData ?
            <div>
                <h2>Choose your pokemon for battle</h2>
                <Grid container className={classes.grid} spacing={5}>
                    {card}
                </Grid>
            </div> : 
            <div>
            <Grid container spacing={5}>
                <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={parseInt(pokemon1.pokemonID, 10)}>
                    <PokeCard pokemon={pokemon1}></PokeCard>
                </Grid>
                <p>VS.</p>
                <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={parseInt(pokemon2.pokemonID, 10)}>
                    <PokeCard pokemon={pokemon2}></PokeCard>
                    <p>Winner!!!</p>
                </Grid>
            </Grid>
            </div> } 
            </div>
        )
    }

    console.log(pokemon1);
    console.log(battle);
    console.log(battleData);
    console.log(l);
    console.log(e);

    if(battleData){

    if (battleData.createBattle.trainerTwo === battleData.createBattle.winner) {
        return (
            <div>
                <Grid container spacing={5}>
                    <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={battleData.createBattle.pokemonOne.pokemonID}>
                        <PokeCard pokemon={battleData.createBattle.pokemonOne}></PokeCard>
                    </Grid>
                    <br />
                    <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key="vs">
                        <h2>VS.</h2>
                    </Grid>
                    <br />
                    <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={battleData.createBattle.pokemonTwo.pokemonID}>
                        <PokeCard pokemon={battleData.createBattle.pokemonTwo}></PokeCard>
                        <p>Winner!!!</p>
                    </Grid>
                </Grid>
            </div>
        )
    }
    else {
        return (
            <div>
                <Grid container spacing={5}>
                    <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={battleData.createBattle.pokemonOne.pokemonID}>
                        <PokeCard pokemon={battleData.createBattle.pokemonOne}></PokeCard>
                        <p>Winner!!!</p>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key="vs">
                        <h2>VS.</h2>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={battleData.createBattle.pokemonTwo.pokemonID}>
                        <PokeCard pokemon={battleData.createBattle.pokemonTwo}></PokeCard>
                    </Grid>
                </Grid>
            </div>
        )
    }
    }
}

export default Battle;