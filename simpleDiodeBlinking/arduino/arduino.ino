#define WIFI_NAME "ania24"
#define WIFI_PASSWORD "tuchowkrakow"
#define DEVICE_ID 123
#define DEVICE_NAME "someName"
#define TOKEN "2342rwefs"

#include <ArduinoHttpClient.h>
#include <RemoteMe.h>
#include <Variables.h>
#include <ESP8266WiFi.h>

#include <ESP8266WiFiMulti.h>


ESP8266WiFiMulti WiFiMulti;
RemoteMe& remoteMe = RemoteMe::getInstance(TOKEN, DEVICE_ID);


uint8_t LEDpin = D5;

void onChange(boolean b) {
	digitalWrite(LEDpin, b ? HIGH : LOW);
}

//*************** CODE FOR CONFORTABLE VARIABLE SET *********************

inline void setMaciekV(boolean b) { remoteMe.getVariables()->setBoolean("maciekV", b); }
inline void setMaciekI(int32_t i) { remoteMe.getVariables()->setInteger("maciekI", i); }

//*************** IMPLEMENT FUNCTIONS BELOW *********************


void onMaciekVChange(boolean b) {
	//your code here
}

void onMaciekIChange(int32_t i) {
	//your code here
}


void setup() {
	
	WiFiMulti.addAP(WIFI_NAME, WIFI_PASSWORD);
	while (WiFiMulti.run() != WL_CONNECTED) {
		delay(100);
	}

	remoteMe.setupTwoWayCommunication();

	remoteMe.sendRegisterDeviceMessage(DEVICE_NAME);

	remoteMe.getVariables()->observeBoolean("maciekV", onMaciekVChange});

	remoteMe.getVariables()->observeInteger("maciekI", onMaciekIChange});

	//----------- YOUR CODE BELOW

}


void loop() {
	remoteMe.loop();
}