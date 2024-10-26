let CONFIG = {
  periodicUpdates: false,
  scanInterval: 5, //secs, this will run a timer for every 60 seconds, that will fetch the voltage
  voltmeterID: 100, //the ID of the voltmeter - When we install the add on, the device will define this number
  MQTTPublishTopic: "/status/voltmeter:", //topic to publish the voltage to, set to the default topic. The message is published with retain:1 so that whichever client connects gets the latest value
}

// get the shelly device id from the mqtt configuration
let SHELLY_ID = undefined;

function getShellyMQTTID() {
  console.log("getShellyMQTTID")
  SHELLY_ID = Shelly.getComponentConfig("MQTT").client_id;
  console.log("getShellyMQTTID.ShellyID:" + SHELLY_ID);
  return;
}

function fetchVoltage() {
  console.log("fetchVoltage")
  //Fetch the voltmeter component
  const voltmeter = Shelly.getComponentStatus(
    "voltmeter:" + JSON.stringify(CONFIG.voltmeterID)
  );

  //exit if can't find the component
  if (typeof voltmeter === "undefined" || voltmeter === null) {
    console.log("fetchVoltage: Can't find the voltmeter component");
    return;
  }

  const voltage = voltmeter["voltage"];

  if (typeof voltage !== "number") {
    console.log("fetchVoltage: can't read the voltage or it is NaN");
    return;
  }
  if (typeof SHELLY_ID === "undefined") {
    console.log("fetchVoltage: can't read shelly mqtt config or it is undefined");
    return;
  }
  if (typeof SHELLY_ID !== "undefined") {
    console.log("fetchVoltage: MQTT publish " + SHELLY_ID + CONFIG.MQTTPublishTopic + JSON.stringify(CONFIG.voltmeterID) + ": " + JSON.stringify(voltmeter));
    MQTT.publish(
      SHELLY_ID + CONFIG.MQTTPublishTopic + JSON.stringify(CONFIG.voltmeterID),
      JSON.stringify(voltmeter),
      0,
      true)
    return;
  }
}

function setTimer() {
  //start the timer
  Timer.set(CONFIG.scanInterval * 1000, true, fetchVoltage);
}

getShellyMQTTID();
fetchVoltage();
if (CONFIG.periodicUpdates === true){
  setTimer();
}