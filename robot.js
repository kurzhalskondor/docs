// One approach to Chapter 7 of eloquentjavascript.net

"use strict";
// jshint esversion: 6

const roads = [
    "Alice's House-Bob's House",   "Alice's House-Cabin",
    "Alice's House-Post Office",   "Bob's House-Town Hall",
    "Daria's House-Ernie's House", "Daria's House-Town Hall",
    "Ernie's House-Grete's House", "Grete's House-Farm",
    "Grete's House-Shop",          "Marketplace-Farm",
    "Marketplace-Post Office",     "Marketplace-Shop",
    "Marketplace-Town Hall",       "Shop-Town Hall"
  ];

  function buildGraph(edges) {
    let graph = Object.create(null);
    function addEdge(from, to) {
      if (graph[from] == null) {
        graph[from] = [to];
      } else {
        graph[from].push(to);
      }
    }
    for (let [from, to] of edges.map(r => r.split("-"))) {
      addEdge(from, to);
      addEdge(to, from);
    }
    return graph;
  }
  
  const roadGraph = buildGraph(roads);

  class VillageState {
    constructor(place, parcels) {
      this.place = place;
      this.parcels = parcels;
    }
  
    move(destination) {
      if (!roadGraph[this.place].includes(destination)) {
        return this;
      } else {
        let parcels = this.parcels.map(p => {
          if (p.place != this.place) return p;
          return {place: destination, address: p.address};
        }).filter(p => p.place != p.address);
        return new VillageState(destination, parcels);
      }
    }
  }

  let first = new VillageState(
    "Post Office",
    [{place: "Post Office", address: "Alice's House"}]
  );
  let next = first.move("Alice's House");
  
//   console.log(next.place);
  // → Alice's House
//   console.log(next.parcels);
  // → []
//   console.log(first.place);
  // → Post Office

  function runRobot(state, robot, memory) {
    let undeliveredParcelTimeSum = 0;
    for (let turn = 0;; turn++) {
      if (state.parcels.length == 0) {
        console.log(`Done in ${turn} turns, ${undeliveredParcelTimeSum} Delay units`);
        break;
      }
      undeliveredParcelTimeSum += state.parcels.length;
      let action = robot(state, memory);
      state = state.move(action.direction);
      memory = action.memory;
      console.log(`Moved to ${action.direction}, ${state.parcels.length} parcels left`);
    }
  }

  
  function runSilentRobot(state, robot, memory) {
    for (let turn = 0;; turn++) {
      if (state.parcels.length == 0) {
        // console.log(`Done in ${turn} turns`);
        return turn;
      }
      let action = robot(state, memory);
      state = state.move(action.direction);
      memory = action.memory;
    //   console.log(`Moved to ${action.direction}, ${state.parcels.length} parcels left`);
    }
  }
  
  function runSilentUtilitarianRobot(state, robot, memory) {
    let undeliveredParcelTimeSum = 0;
    for (let turn = 0;; turn++) {
      if (state.parcels.length == 0) {
        // console.log(`Done in ${turn} turns`);
        return undeliveredParcelTimeSum;
      }
      undeliveredParcelTimeSum += state.parcels.length;
      let action = robot(state, memory);
      state = state.move(action.direction);
      memory = action.memory;
    //   console.log(`Moved to ${action.direction}, ${state.parcels.length} parcels left`);
    }
  }


  function randomPick(array) {
    let choice = Math.floor(Math.random() * array.length);
    return array[choice];
  }
  
  function randomRobot(state) {
    return {direction: randomPick(roadGraph[state.place])};
  }

  VillageState.random = function(parcelCount = 5) {
    let parcels = [];
    for (let i = 0; i < parcelCount; i++) {
      let address = randomPick(Object.keys(roadGraph));
      let place;
      do {
        place = randomPick(Object.keys(roadGraph));
      } while (place == address);
      parcels.push({place, address});
    }
    return new VillageState("Post Office", parcels);
  };

//   runRobot(VillageState.random(), randomRobot);

  const mailRoute = [
    "Alice's House", "Cabin", "Alice's House", "Bob's House",
    "Town Hall", "Daria's House", "Ernie's House",
    "Grete's House", "Shop", "Grete's House", "Farm",
    "Marketplace", "Post Office"
  ];

  function routeRobot(state, memory) {
    if (memory.length == 0) {
      memory = mailRoute;
    }
    return {direction: memory[0], memory: memory.slice(1)};
  }

//   runRobot(VillageState.random(), routeRobot, []);

function findRoute(graph, from, to) {
    let work = [{at: from, route: []}];
    for (let i = 0; i < work.length; i++) {
      let {at, route} = work[i];
      for (let place of graph[at]) {
        if (place == to) return route.concat(place);
        if (!work.some(w => w.at == place)) {
          work.push({at: place, route: route.concat(place)});
        }
      }
    }
  }

  function goalOrientedRobot({place, parcels}, route) {
    if (route.length == 0) {
      let parcel = parcels[0];
      if (parcel.place != place) {
        route = findRoute(roadGraph, place, parcel.place);
      } else {
        route = findRoute(roadGraph, place, parcel.address);
      }
    }
    return {direction: route[0], memory: route.slice(1)};
  }

//   runRobot(VillageState.random(), goalOrientedRobot, []);

  function compareRobots(robot1, memory1, robot2, memory2) {
      let numberRuns = 100;
      let firstRobot = {
          turns: 0
      };
      let secondRobot = {
          turns: 0
      };
    for (let i = 0; i < numberRuns; i++){
        let compVillageState = VillageState.random();
        firstRobot.turns += runSilentRobot(compVillageState, robot1, memory1);
        secondRobot.turns += runSilentRobot(compVillageState, robot2, memory2);
    }
    console.log(`First Robot took ${firstRobot.turns / numberRuns} turns on average`);
    console.log(`Second Robot took ${secondRobot.turns / numberRuns} turns on average`);
    if (firstRobot.turns < secondRobot.turns){
        return robot1;
    } else {
        return robot2;
    }
  }

  
  function utilitarianCompareRobots(robot1, memory1, robot2, memory2) {
    let numberRuns = 100;
    let firstRobot = {
      delay: 0
    };
    let secondRobot = {
      delay: 0
    };
  for (let i = 0; i < numberRuns; i++){
      let compVillageState = VillageState.random();
      firstRobot.delay += runSilentUtilitarianRobot(compVillageState, robot1, memory1);
      secondRobot.delay += runSilentUtilitarianRobot(compVillageState, robot2, memory2);
  }
  console.log(`First Robot had ${firstRobot.delay / numberRuns} delay units on average`);
  console.log(`Second Robot had ${secondRobot.delay / numberRuns} delay units on average`);
  if (firstRobot.delay < secondRobot.delay){
      return robot1;
  } else {
      return robot2;
  }
}
  
  //compareRobots(routeRobot, [], goalOrientedRobot, []);
  //utilitarianCompareRobots(myRobot1, [], myRobot2, []);

  //always choose nearest productive action (parcel pick up or drop off)
  function myRobot1({place, parcels}, route) {
    if (route.length == 0) {
      
      let parcel = parcels[0];
      if (parcel.place != place) {
        route = findRoute(roadGraph, place, parcel.place);
      } else {
        route = findRoute(roadGraph, place, parcel.address);
      }
      let routeAlt;
      for (let i = 1; i < parcels.length; i++){
        let parcelAlt = parcels[i];
        if (parcelAlt.place != place) {
          routeAlt = findRoute(roadGraph, place, parcelAlt.place);
        } else {
          routeAlt = findRoute(roadGraph, place, parcelAlt.address);
        }
        if (routeAlt.length < route.length){
          route = routeAlt;
        }
      } 
    }
    return {direction: route[0], memory: route.slice(1)};
  }
  
  // first pick up parcels, then drop off
  function myRobot2({place, parcels}, route) {
    if (route.length == 0) {
      
      let routeAlt = null;
      for (let i = 0; i < parcels.length; i++){
        let parcel = parcels[i];
        if (parcel.place != place) {
          routeAlt = findRoute(roadGraph, place, parcel.place);
          if ( route.length == 0 || routeAlt.length < route.length)  {
            route = routeAlt;
          }
        } 
      }
      if (route.length == 0){
        for (let i = 0; i < parcels.length; i++){
          let parcel = parcels[i];
          routeAlt = findRoute(roadGraph, place, parcel.address);
          if ( route.length == 0 || routeAlt.length < route.length)  {
            route = routeAlt;
          }
        }
      }
    }
    return {direction: route[0], memory: route.slice(1)};
  }