#define WIFI_NAME "ania24"
#define WIFI_PASSWORD "tuchowkrakow"
#define DEVICE_ID 1
#define DEVICE_NAME "test"
#define TOKEN "~1_VLTq=uGG@M1Hp"


#include <RemoteMe.h>

#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>


ESP8266WiFiMulti WiFiMulti;
RemoteMe& remoteMe = RemoteMe::getInstance(TOKEN, DEVICE_ID);

//*************** CODE FOR CONFORTABLE VARIABLE SET *********************

inline void setButton1(boolean b) { remoteMe.getVariables()->setBoolean("button1", b); }
inline void setButton2(boolean b) { remoteMe.getVariables()->setBoolean("button2", b); }
inline void setButton3(boolean b) { remoteMe.getVariables()->setBoolean("button3", b); }

//*************** IMPLEMENT FUNCTIONS BELOW *********************


void onButton1Change(boolean b) {
	Serial.println(b);
}

void onButton2Change(boolean b) {
	Serial.println(b);
}

void onButton3Change(boolean b) {
	Serial.println(b);
}
void onUserMessage(uint16_t senderDeviceId, uint16_t dataSize, uint8_t *data) {
	Serial.println("on User  message");


}
void setup() {
	Serial.begin(9600);
	WiFiMulti.addAP(WIFI_NAME, WIFI_PASSWORD);
	while (WiFiMulti.run() != WL_CONNECTED) {
		delay(100);
	}
	remoteMe.setUserMessageListener(onUserMessage);
	remoteMe.setupTwoWayCommunication();
	remoteMe.sendRegisterDeviceMessage(DEVICE_NAME);
	remoteMe.getVariables()->observeBoolean("button1", onButton1Change);
	remoteMe.getVariables()->observeBoolean("button2", onButton2Change);
	remoteMe.getVariables()->observeBoolean("button3", onButton3Change);

}


void loop() {
	remoteMe.loop();
}

