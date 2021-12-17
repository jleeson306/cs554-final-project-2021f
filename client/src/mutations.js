import { gql } from '@apollo/client';

const CHANGE_FUNDS = gql`
    mutation ChangeFunds($userName: String, $toChange: Int) {
        changeFunds(userName: $userName, toChange: $toChange)
    }
`;

const CHANGE_POPULARITY = gql`
    mutation ChangePokemonPopularity($pokemonName: String, $toChange: Int) {
        changePokemonPopularity(pokemonName: $pokemonName, toChange: $toChange)
    }  
`;

const PLACE_BET = gql`
    mutation Mutation($userName: String, $betAmount: Int, $battleId: String, $predictedWinner: String) {
        createBet(userName: $userName, betAmount: $betAmount, battleID: $battleId, predictedWinner: $predictedWinner) {
            userName
            predictedWinner
            payout
        }
  }
`

const ADD_POKEMON = gql`
    mutation AddPokemon($pokemonID: String!, $pokemonName: String!, $imageLink: String!, $isShiny: Boolean!, $userName: String!){
        addPokemon(pokemonID: $pokemonID, pokemonName: $pokemonName, imageLink: $imageLink, isShiny: $isShiny, userName: $userName){
            userName
            pokemonName
        }
    }
`;

let mutations = {
    CHANGE_FUNDS,
    CHANGE_POPULARITY,
    PLACE_BET,
    ADD_POKEMON
}

export default mutations;