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

enum WifiChannel {
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

enum ESPNOW_Data_Type {
    //% block="Radio"
    1,
    //% block="RC"
    2,
    //% block="String"
    3,
    //% block="int"
    4,
    //% block="float"
    5
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
        Generator.addCode('chs[int(' + ch + ')-1]');
    }
    //获取MAC地址
    //% block="Wifi get MAC" blockType="reporter"
    export function GetMAC(parameter: any, block: any) {
        Generator.addCode('WiFi.macAddress()');
    }

    //初始化ESPNOW
    //% block="ESPNOW Begin MAC:[ADDR] Channel:[CHANNEL]" blockType="command"
    //% ADDR.shadow="normal" ADDR.defl="FF:FF:FF:FF:FF:FF"
    //% CHANNEL.shadow="dropdownRound" CHANNEL.options="WifiChannel"
    export function Begin(parameter: any, block: any) {
        let addr = parameter.ADDR.code;
        let ch = parameter.CHANNEL.code;
        if (Generator.board == 'esp8266') {
            Generator.addInclude('Wifi8266', '#include <ESP8266WiFi.h>');
            Generator.addInclude('ESPNOW', '#include <espnow.h>');
        }
        else {
            Generator.addInclude('Wifi32', '#include <WiFi.h>');
            Generator.addInclude('ESPNOW', '#include <esp_now.h>');
        }
        Generator.addObject('ESPNOW_UNION_DATA', 'union', 'Data \r{\r   int n;\r   float f;\r   char c[32];\r} EspNow_SData,EspNow_RData;')
        Generator.addObject('ESPNOW_struct_message', 'typedef struct', 'struct_message \r{\r   char Type;\r   char Data[32];\r} struct_message;')
        Generator.addObject('ESPNOW_send_message', 'struct_message', 'ESPNOW_send_message')
        Generator.addObject('ESPNOW_recv_message', 'struct_message', 'ESPNOW_recv_message')
        addr = addr.slice(1, addr.length - 1)
        var Macs = addr.split(':')
        if (Macs.length >= 6) {
            addr = "{"
            for (var i = 0; i < Macs.length; i++) {
                addr += '0x' + Macs[i]
                if (i < Macs.length - 1) {
                    addr += ","
                }
            }
            addr += "}"
        }
        Generator.addSetup('Wifi_Set_STA', 'WiFi.mode(WIFI_STA);')
        Generator.addSetup('Wifi_Dis_Net', 'WiFi.disconnect();')
        Generator.addObject('ESPNOW_State', 'int', 'ESPNOW_State;')
        Generator.addObject('ESPNOW_PeerState', 'int', 'ESPNOW_AddPeerState;');
        Generator.addObject('ESPNOW_BroadcastAddress', 'uint8_t', 'broadcastAddress[]=' + addr + ';')
        Generator.addSetup('ESPNOW_Init', 'ESPNOW_State=esp_now_init();')
        Generator.addSetup('ESPNOW_PeerInfo', 'esp_now_peer_info_t peerInfo;')
        Generator.addSetup('ESPNOW_SetAddr', 'memcpy(peerInfo.peer_addr, broadcastAddress, 6);')
        Generator.addSetup('ESPNOW_SetChannel', 'peerInfo.channel = ' + ch + ';')
        Generator.addSetup('ESPNOW_SetEncrypt', 'peerInfo.encrypt = false;')
        Generator.addSetup('ESPNOW_AddPeerInfo', 'ESPNOW_AddPeerState=esp_now_add_peer(&peerInfo);')
        
    }
    //当消息发送时
    //% block="ESPNOW Send Event" blockType="hat"
    export function SendEvent(parameter: any, block: any) {
        Generator.addSetup('ESPNOW_Send_Event', 'esp_now_register_send_cb(OnDataSend);')
        Generator.addEvent("ESPNOW_Send_Event", "void", "OnDataSend", "const uint8_t *mac_addr, esp_now_send_status_t status");
    }
    //发送消息
    //% block="ESPNOW Send Type:[DTYPE] Data:[DATA]" blockType="command"
    //% DATA.shadow="normal"
    //% DTYPE.shadow="dropdown" DTYPE.options="ESPNOW_Data_Type"
    export function Send(parameter: any, block: any) {
        let data = parameter.DATA.code;
        let type = parameter.DTYPE.code;
        Generator.addCode('ESPNOW_send_message.Type='+type+';');
        if(data[0]=='"')
        {
            Generator.addCode('String('+data+').toCharArray(ESPNOW_send_message.Data, sizeof(ESPNOW_send_message.Data));');
        }
        else
        {
            switch(type)
            {
                case '3':
                    Generator.addCode(data+'.toCharArray(ESPNOW_send_message.Data, sizeof(ESPNOW_send_message.Data));')
                    break;
                case '4':
                    Generator.addCode('int EspNow_Send_N=(int)'+data+';');
                    Generator.addCode('memcpy(&ESPNOW_send_message.Data,&EspNow_Send_N,sizeof(EspNow_Send_N));')
                    break;
                case '5':
                    Generator.addCode('float EspNow_Send_F='+data+';');
                    Generator.addCode('memcpy(&ESPNOW_send_message.Data,&EspNow_Send_F,sizeof(EspNow_Send_F));')
                    break;
                default:
                    Generator.addCode('memcpy(&ESPNOW_send_message.Data,&'+data+',sizeof('+data+'));')
                    break;
            }  
        }
        Generator.addCode('esp_now_send(broadcastAddress, (uint8_t *) &ESPNOW_send_message, sizeof(ESPNOW_send_message));');
    }
    //当接收消息时
    //% block="ESPNOW Recv Event" blockType="hat"
    export function RecvEvent(parameter: any, block: any) {
        Generator.addSetup('ESPNOW_Recv_Event', 'esp_now_register_recv_cb(OnDataRecv);')
        Generator.addEvent("ESPNOW_Recv_Event", "void", "OnDataRecv", "const uint8_t * mac, const uint8_t *incomingData, int len");
        Generator.addCode('memcpy(&ESPNOW_recv_message, incomingData, sizeof(ESPNOW_recv_message));');
        Generator.addCode('memcpy(&EspNow_RData.c,&ESPNOW_recv_message.Data,32);');
    }
    //消息类型
    //% block="ESPNOW Massage Type is [DTYPE]" blockType="boolean"
    //% DTYPE.shadow="dropdown" DTYPE.options="ESPNOW_Data_Type"
    export function IsDataType(parameter: any, block: any) {
        let dtype = parameter.DTYPE.code;
        Generator.addCode('(ESPNOW_recv_message.Type==' + dtype+')');
    }
    //消息数据
    //% block="ESPNOW Massage [DTYPE]" blockType="reporter"
    //% DTYPE.shadow="dropdown" DTYPE.options="ESPNOW_Data_Type"
    export function ReceData(parameter: any, block: any) {
        let dtype = parameter.DTYPE.code;
        switch(dtype)
        {
            case '4':
                Generator.addCode('(EspNow_RData.n)')
                break;
            case '5':
                Generator.addCode('(EspNow_RData.f)')
                break;
            default:
                Generator.addCode('(EspNow_RData.c)')
                break;
        }
        
    }
    //广播地址
    //% block="ESPNOW Radio Address" blockType="reporter"
    export function RadioAddress(parameter: any, block: any) {
        Generator.addObject('RadioAddress', 'uint8_t', 'RadioAddress[]={0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF};');
        Generator.addCode('RadioAddress');
    }
}
