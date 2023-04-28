enum AsyncOrSync {
    //% block="Sync"
    0,
    //% block="Async"
    1
}

enum NetInfo {
    //% block="SSID"
    SSID,
    //% block="RSSI"
    RSSI,
    //% block="IsOpen"
    IsOpen,
    //% block="MAC"
    MAC,
    //% block="MACStr"
    MACStr,
    //% block="Channel"
    Channel,
    //% block="ALL"
    ALL
}

enum ScanState {
    //% block="OK"
    OK,
    //% block="Carry"
    Carry,
    //% block="Not Start"
    Not_Start,
}

enum WifiChannel{
    //% block="1"
    1,
    //% block="2"
    2,
    //% block="3"
    3,
    //% block="4"
    4,
    //% block="5"
    5,
    //% block="6"
    6,
    //% block="7"
    7,
    //% block="8"
    8,
    //% block="9"
    9,
    //% block="10"
    10,
    //% block="11"
    11,
    //% block="12"
    12,
    //% block="13"
    13,
}

//% color="#00AAFF" iconWidth=50 iconHeight=40
namespace WifiScan_AND_ESPNOW {
    //扫描WIFI
    //% block="Wifi [IsAsync] scan" blockType="command"
    //% IsAsync.shadow="dropdown" IsAsync.options="AsyncOrSync"
    export function Scan(parameter: any, block: any) {
        let isSync = parameter.IsAsync.code;
        if (Generator.board == 'esp8266') {
            Generator.addInclude('Wifi8266', '#include <ESP8266WiFi.h>');
        }
        else {
            Generator.addInclude('Wifi32', '#include <WiFi.h>');
        }
        Generator.addSetup('Wifi_Set_STA', 'WiFi.mode(WIFI_STA);');
        Generator.addSetup('Wifi_Dis_Net', 'WiFi.disconnect();');
        if (isSync == 0) {
            Generator.addObject('AP_Number', 'int', 'AP_Number=0;');
            Generator.addCode('AP_Number = WiFi.scanNetworks(false,true);');
        }
        else {
            Generator.addObject('AP_Number', 'int', 'AP_Number=0;');
            Generator.addCode('WiFi.scanNetworks(true,true);');
        }
    }

    //扫描状态
    //% block="Wifi scan state [SState]" blockType="boolean"
    //% SState.shadow="dropdown" SState.options="ScanState"
    export function State(parameter: any, block: any) {
        let sState = parameter.SState.code;
        switch (sState) {
            case "OK":
                Generator.addCode('WiFi.scanComplete()>=0');
                break;
            case "Carry":
                Generator.addCode('WiFi.scanComplete()==-1');
                break;
            case "Not_Start":
                Generator.addCode('WiFi.scanComplete()==-2');
                break;
        }
    }

    //Wifi数量
    //% block="Wifi number" blockType="reporter"
    export function Number(parameter: any, block: any) {
        Generator.addObject('AP_Number', 'int', 'AP_Number=0;');
        Generator.addCode('AP_Number');
    }

    //Wifi数量获取
    //% block="Wifi get number" blockType="command"
    export function GetNumber(parameter: any, block: any) {
        Generator.addObject('AP_Number', 'int', 'AP_Number=0;');
        Generator.addCode('AP_Number=WiFi.scanComplete();');
    }

    //Wifi信息
    //% block="Wifi [Index] information [Net] " blockType="reporter"
    //% Net.shadow="dropdown" Net.options="NetInfo"
    //% Index.shadow="number" Index.defl="0"
    export function Information(parameter: any, block: any) {
        let net = parameter.Net.code;
        let index = parameter.Index.code;
        switch (net) {
            case "SSID":
                Generator.addCode('WiFi.SSID(' + index + ')');
                break;
            case "RSSI":
                Generator.addCode('WiFi.RSSI(' + index + ')');
                break;
            case "Channel":
                Generator.addCode('WiFi.channel(' + index + ')');
                break;
            case "MAC":
                Generator.addCode('WiFi.BSSID(' + index + ')');
                break;
            case "MACStr":
                Generator.addCode('WiFi.BSSIDstr(' + index + ')');
                break;
            case "IsOpen":
                Generator.addCode('((WiFi.encryptionType(' + index + ') == ENC_TYPE_NONE)?1:0)');
                break;
            case "ALL":
                Generator.addCode('"SSID:"+String(WiFi.SSID(' + index + '))');
                Generator.addCode('+" RSSI:"+String(WiFi.RSSI(' + index + '))+"dbm"');
                Generator.addCode('+" Channel:"+String(WiFi.channel(' + index + '))');
                Generator.addCode('+" Mac:"+String(WiFi.BSSIDstr(' + index + '))');
                if (Generator.board == 'esp8266') {
                    Generator.addCode('+" IsOpen:"+((WiFi.encryptionType(' + index + ') == ENC_TYPE_NONE)?"YES":"NO")');
                }
                else {
                    Generator.addCode('+" IsOpen:"+((WiFi.encryptionType(' + index + ') == WIFI_AUTH_OPEN)?"YES":"NO")');
                }
                break;
        }
    }
    //Wifi信息清除
    //% block="Wifi delete Info" blockType="command"
    export function Delete_Info(parameter: any, block: any) {
        Generator.addCode('WiFi.scanDelete();');
    }
    //计算WIFI信道干扰数
    //% block="Wifi Compute ChannelNum" blockType="command"
    export function ComCH(parameter: any, block: any) {
        Generator.addObject('ChannelNum', 'int', 'chs[13];');
        Generator.addCode('for(char i=0;i<WiFi.scanComplete();i++)');
        Generator.addCode('  chs[WiFi.channel(i)-1]+=1;');
    }
    //获取WIFI信道干扰数
    //% block="Wifi get channel [CHANNEL]" blockType="reporter"
    //% CHANNEL.shadow="dropdownRound" CHANNEL.options="WifiChannel"
    export function GetCH(parameter: any, block: any) {
        let ch = parameter.CHANNEL.code;
        Generator.addObject('ChannelNum', 'int', 'chs[13];');
        Generator.addCode('chs[int('+ch+')-1]');
    }
}
