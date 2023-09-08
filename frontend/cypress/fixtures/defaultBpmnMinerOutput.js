export default `<?xml version="1.0" encoding="UTF-8"?><definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" targetNamespace="http://www.omg.org/bpmn20" exporter="ProM. http://www.promtools.org/prom6" exporterVersion="6.3" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd"><process id="proc_1179381257">
<startEvent id="node_ce942636-8422-4e4b-ad58-5a3f5fbd7533" name=""/>
<endEvent id="node_9890d676-9589-4afc-9278-1ab966a9d097" name=""/>
<task id="node_56af377b-0cc2-418c-912c-27d380d943ce" name="Repair (Simple)"/>
<task id="node_fb5c6eee-13bb-42a4-a4da-3b3932fd3772" name="Analyze Defect"/>
<task id="node_0f663592-5d77-4f4f-914a-20978b1c94dc" name="Archive Repair"/>
<task id="node_481fae60-2f56-4a09-abf0-0e0fa5dceb3e" name="Inform User"/>
<task id="node_e94adff6-5a3a-40ea-8c8b-03802340edf0" name="Test Repair"/>
<task id="node_a326f9e1-d52d-474e-bb6f-3c86e5a75818" name="Restart Repair"/>
<task id="node_65217331-a624-4557-aaf2-322e9750634c" name="Register"/>
<task id="node_41d9104c-2d2a-4b9c-afc6-d50bfb2e5c4a" name="Repair (Complex)"/>
<exclusiveGateway id="node_fa182316-ef96-4836-9fc8-a4f55829fcc8" name="" gatewayDirection="Diverging">
<incoming>
node_dc7e96e1-8e7c-4bcb-8645-fea025ec8c4d</incoming>
<outgoing>
node_184bd503-ab8d-4302-a302-91b85e84192f</outgoing>
<outgoing>
node_f9007d59-d184-4c95-affa-54ae9063a5b7</outgoing>
</exclusiveGateway>
<exclusiveGateway id="node_b97adedf-e642-47d0-8cfe-967cd0cac5be" name="" gatewayDirection="Converging">
<incoming>
node_de4d7ae8-3ee7-4947-a7ab-b38ddccaef80</incoming>
<incoming>
node_aa901d75-4451-4e14-a24c-6a222d54f086</incoming>
<outgoing>
node_2133f7a6-618b-4377-aae9-93ee53b7ad93</outgoing>
</exclusiveGateway>
<exclusiveGateway id="node_628f9c53-8610-4e5e-aa0c-6a5eaa7f91b0" name="" gatewayDirection="Converging">
<incoming>
node_51bbbd44-70b2-46f1-b66e-ab0818198e48</incoming>
<incoming>
node_32e64aa7-a62a-4e28-a532-fef00e3f8601</incoming>
<outgoing>
node_719aa8ac-a182-4cbe-8646-b41c326f84f7</outgoing>
</exclusiveGateway>
<exclusiveGateway id="node_edee07ab-e4bf-4724-9b5e-48e7d9d287cd" name="" gatewayDirection="Diverging">
<incoming>
node_b2d53621-2905-429d-85f7-bd1e384e77a2</incoming>
<outgoing>
node_7c0861b8-aa4d-4eb6-b411-df68486acde9</outgoing>
<outgoing>
node_aa901d75-4451-4e14-a24c-6a222d54f086</outgoing>
</exclusiveGateway>
<sequenceFlow id="node_9d4f932a-49d1-4897-93b8-a84535148a62" name="" sourceRef="node_0f663592-5d77-4f4f-914a-20978b1c94dc" targetRef="node_9890d676-9589-4afc-9278-1ab966a9d097"/>
<sequenceFlow id="node_ad05082e-b9df-431f-b891-cbeb3e338211" name="" sourceRef="node_65217331-a624-4557-aaf2-322e9750634c" targetRef="node_fb5c6eee-13bb-42a4-a4da-3b3932fd3772"/>
<sequenceFlow id="node_15d28ff7-e322-4348-a8f7-3107d9bb168c" name="" sourceRef="node_481fae60-2f56-4a09-abf0-0e0fa5dceb3e" targetRef="node_41d9104c-2d2a-4b9c-afc6-d50bfb2e5c4a"/>
<sequenceFlow id="node_ac530d84-43b3-4a7b-80c3-115b2675c2d3" name="" sourceRef="node_ce942636-8422-4e4b-ad58-5a3f5fbd7533" targetRef="node_65217331-a624-4557-aaf2-322e9750634c"/>
<sequenceFlow id="node_b2d53621-2905-429d-85f7-bd1e384e77a2" name="" sourceRef="node_fb5c6eee-13bb-42a4-a4da-3b3932fd3772" targetRef="node_edee07ab-e4bf-4724-9b5e-48e7d9d287cd"/>
<sequenceFlow id="node_7c0861b8-aa4d-4eb6-b411-df68486acde9" name="" sourceRef="node_edee07ab-e4bf-4724-9b5e-48e7d9d287cd" targetRef="node_481fae60-2f56-4a09-abf0-0e0fa5dceb3e"/>
<sequenceFlow id="node_dc7e96e1-8e7c-4bcb-8645-fea025ec8c4d" name="" sourceRef="node_e94adff6-5a3a-40ea-8c8b-03802340edf0" targetRef="node_fa182316-ef96-4836-9fc8-a4f55829fcc8"/>
<sequenceFlow id="node_f9007d59-d184-4c95-affa-54ae9063a5b7" name="" sourceRef="node_fa182316-ef96-4836-9fc8-a4f55829fcc8" targetRef="node_a326f9e1-d52d-474e-bb6f-3c86e5a75818"/>
<sequenceFlow id="node_184bd503-ab8d-4302-a302-91b85e84192f" name="" sourceRef="node_fa182316-ef96-4836-9fc8-a4f55829fcc8" targetRef="node_0f663592-5d77-4f4f-914a-20978b1c94dc"/>
<sequenceFlow id="node_2133f7a6-618b-4377-aae9-93ee53b7ad93" name="" sourceRef="node_b97adedf-e642-47d0-8cfe-967cd0cac5be" targetRef="node_56af377b-0cc2-418c-912c-27d380d943ce"/>
<sequenceFlow id="node_de4d7ae8-3ee7-4947-a7ab-b38ddccaef80" name="" sourceRef="node_a326f9e1-d52d-474e-bb6f-3c86e5a75818" targetRef="node_b97adedf-e642-47d0-8cfe-967cd0cac5be"/>
<sequenceFlow id="node_aa901d75-4451-4e14-a24c-6a222d54f086" name="" sourceRef="node_edee07ab-e4bf-4724-9b5e-48e7d9d287cd" targetRef="node_b97adedf-e642-47d0-8cfe-967cd0cac5be"/>
<sequenceFlow id="node_719aa8ac-a182-4cbe-8646-b41c326f84f7" name="" sourceRef="node_628f9c53-8610-4e5e-aa0c-6a5eaa7f91b0" targetRef="node_e94adff6-5a3a-40ea-8c8b-03802340edf0"/>
<sequenceFlow id="node_51bbbd44-70b2-46f1-b66e-ab0818198e48" name="" sourceRef="node_56af377b-0cc2-418c-912c-27d380d943ce" targetRef="node_628f9c53-8610-4e5e-aa0c-6a5eaa7f91b0"/>
<sequenceFlow id="node_32e64aa7-a62a-4e28-a532-fef00e3f8601" name="" sourceRef="node_41d9104c-2d2a-4b9c-afc6-d50bfb2e5c4a" targetRef="node_628f9c53-8610-4e5e-aa0c-6a5eaa7f91b0"/>
</process>
<bpmndi:BPMNDiagram id="id_1466045541">
<bpmndi:BPMNPlane bpmnElement="proc_1179381257">
<bpmndi:BPMNShape bpmnElement="node_edee07ab-e4bf-4724-9b5e-48e7d9d287cd">
<dc:Bounds x="336.0" y="162.5" width="25.0" height="25.0"/>
<bpmndi:BPMNLabel/>
</bpmndi:BPMNShape>
<bpmndi:BPMNShape bpmnElement="node_fa182316-ef96-4836-9fc8-a4f55829fcc8">
<dc:Bounds x="876.0" y="154.5" width="25.0" height="25.0"/>
<bpmndi:BPMNLabel/>
</bpmndi:BPMNShape>
<bpmndi:BPMNShape bpmnElement="node_481fae60-2f56-4a09-abf0-0e0fa5dceb3e">
<dc:Bounds x="411.0" y="126.0" width="80.0" height="40.0"/>
<bpmndi:BPMNLabel/>
</bpmndi:BPMNShape>
<bpmndi:BPMNShape bpmnElement="node_b97adedf-e642-47d0-8cfe-967cd0cac5be">
<dc:Bounds x="438.5" y="195.5" width="25.0" height="25.0"/>
<bpmndi:BPMNLabel/>
</bpmndi:BPMNShape>
<bpmndi:BPMNShape bpmnElement="node_0f663592-5d77-4f4f-914a-20978b1c94dc">
<dc:Bounds x="951.0" y="116.0" width="80.0" height="40.0"/>
<bpmndi:BPMNLabel/>
</bpmndi:BPMNShape>
<bpmndi:BPMNShape bpmnElement="node_628f9c53-8610-4e5e-aa0c-6a5eaa7f91b0">
<dc:Bounds x="671.0" y="144.5" width="25.0" height="25.0"/>
<bpmndi:BPMNLabel/>
</bpmndi:BPMNShape>
<bpmndi:BPMNShape bpmnElement="node_9890d676-9589-4afc-9278-1ab966a9d097">
<dc:Bounds x="1081.0" y="123.5" width="25.0" height="25.0"/>
<bpmndi:BPMNLabel/>
</bpmndi:BPMNShape>
<bpmndi:BPMNShape bpmnElement="node_56af377b-0cc2-418c-912c-27d380d943ce">
<dc:Bounds x="541.0" y="171.0" width="80.0" height="40.0"/>
<bpmndi:BPMNLabel/>
</bpmndi:BPMNShape>
<bpmndi:BPMNShape bpmnElement="node_fb5c6eee-13bb-42a4-a4da-3b3932fd3772">
<dc:Bounds x="206.0" y="153.0" width="80.0" height="40.0"/>
<bpmndi:BPMNLabel/>
</bpmndi:BPMNShape>
<bpmndi:BPMNShape bpmnElement="node_ce942636-8422-4e4b-ad58-5a3f5fbd7533">
<dc:Bounds x="1.0" y="158.5" width="25.0" height="25.0"/>
<bpmndi:BPMNLabel/>
</bpmndi:BPMNShape>
<bpmndi:BPMNShape bpmnElement="node_e94adff6-5a3a-40ea-8c8b-03802340edf0">
<dc:Bounds x="746.0" y="142.0" width="80.0" height="40.0"/>
<bpmndi:BPMNLabel/>
</bpmndi:BPMNShape>
<bpmndi:BPMNShape bpmnElement="node_a326f9e1-d52d-474e-bb6f-3c86e5a75818">
<dc:Bounds x="951.0" y="186.0" width="80.0" height="40.0"/>
<bpmndi:BPMNLabel/>
</bpmndi:BPMNShape>
<bpmndi:BPMNShape bpmnElement="node_65217331-a624-4557-aaf2-322e9750634c">
<dc:Bounds x="76.0" y="151.0" width="80.0" height="40.0"/>
<bpmndi:BPMNLabel/>
</bpmndi:BPMNShape>
<bpmndi:BPMNShape bpmnElement="node_41d9104c-2d2a-4b9c-afc6-d50bfb2e5c4a">
<dc:Bounds x="541.0" y="101.0" width="80.0" height="40.0"/>
<bpmndi:BPMNLabel/>
</bpmndi:BPMNShape>
<bpmndi:BPMNEdge bpmnElement="node_32e64aa7-a62a-4e28-a532-fef00e3f8601">
<di:waypoint x="581.0" y="121.0"/>
<di:waypoint x="683.5" y="157.0"/>
</bpmndi:BPMNEdge>
<bpmndi:BPMNEdge bpmnElement="node_9d4f932a-49d1-4897-93b8-a84535148a62">
<di:waypoint x="991.0" y="136.0"/>
<di:waypoint x="1093.5" y="136.0"/>
</bpmndi:BPMNEdge>
<bpmndi:BPMNEdge bpmnElement="node_719aa8ac-a182-4cbe-8646-b41c326f84f7">
<di:waypoint x="683.5" y="157.0"/>
<di:waypoint x="786.0" y="162.0"/>
</bpmndi:BPMNEdge>
<bpmndi:BPMNEdge bpmnElement="node_2133f7a6-618b-4377-aae9-93ee53b7ad93">
<di:waypoint x="451.0" y="208.0"/>
<di:waypoint x="581.0" y="191.0"/>
</bpmndi:BPMNEdge>
<bpmndi:BPMNEdge bpmnElement="node_51bbbd44-70b2-46f1-b66e-ab0818198e48">
<di:waypoint x="581.0" y="191.0"/>
<di:waypoint x="683.5" y="157.0"/>
</bpmndi:BPMNEdge>
<bpmndi:BPMNEdge bpmnElement="node_dc7e96e1-8e7c-4bcb-8645-fea025ec8c4d">
<di:waypoint x="786.0" y="162.0"/>
<di:waypoint x="888.5" y="167.0"/>
</bpmndi:BPMNEdge>
<bpmndi:BPMNEdge bpmnElement="node_de4d7ae8-3ee7-4947-a7ab-b38ddccaef80">
<di:waypoint x="991.0" y="206.0"/>
<di:waypoint x="888.5" y="241.0"/>
<di:waypoint x="786.0" y="241.0"/>
<di:waypoint x="683.5" y="241.0"/>
<di:waypoint x="581.0" y="241.0"/>
<di:waypoint x="451.0" y="208.0"/>
</bpmndi:BPMNEdge>
<bpmndi:BPMNEdge bpmnElement="node_b2d53621-2905-429d-85f7-bd1e384e77a2">
<di:waypoint x="246.0" y="173.0"/>
<di:waypoint x="348.5" y="175.0"/>
</bpmndi:BPMNEdge>
<bpmndi:BPMNEdge bpmnElement="node_7c0861b8-aa4d-4eb6-b411-df68486acde9">
<di:waypoint x="348.5" y="175.0"/>
<di:waypoint x="451.0" y="146.0"/>
</bpmndi:BPMNEdge>
<bpmndi:BPMNEdge bpmnElement="node_184bd503-ab8d-4302-a302-91b85e84192f">
<di:waypoint x="888.5" y="167.0"/>
<di:waypoint x="991.0" y="136.0"/>
</bpmndi:BPMNEdge>
<bpmndi:BPMNEdge bpmnElement="node_ad05082e-b9df-431f-b891-cbeb3e338211">
<di:waypoint x="116.0" y="171.0"/>
<di:waypoint x="246.0" y="173.0"/>
</bpmndi:BPMNEdge>
<bpmndi:BPMNEdge bpmnElement="node_aa901d75-4451-4e14-a24c-6a222d54f086">
<di:waypoint x="348.5" y="175.0"/>
<di:waypoint x="451.0" y="208.0"/>
</bpmndi:BPMNEdge>
<bpmndi:BPMNEdge bpmnElement="node_f9007d59-d184-4c95-affa-54ae9063a5b7">
<di:waypoint x="888.5" y="167.0"/>
<di:waypoint x="991.0" y="206.0"/>
</bpmndi:BPMNEdge>
<bpmndi:BPMNEdge bpmnElement="node_ac530d84-43b3-4a7b-80c3-115b2675c2d3">
<di:waypoint x="13.5" y="171.0"/>
<di:waypoint x="116.0" y="171.0"/>
</bpmndi:BPMNEdge>
<bpmndi:BPMNEdge bpmnElement="node_15d28ff7-e322-4348-a8f7-3107d9bb168c">
<di:waypoint x="451.0" y="146.0"/>
<di:waypoint x="581.0" y="121.0"/>
</bpmndi:BPMNEdge>
</bpmndi:BPMNPlane>
</bpmndi:BPMNDiagram>
</definitions>`