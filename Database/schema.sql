CREATE TABLE IF NOT EXISTS processing_graph (
    name VARCHAR(255) PRIMARY KEY,
    description TEXT default '',
    modified TIMESTAMP DEFAULT now(),
    deleted BOOLEAN DEFAULT FALSE,
    created TIMESTAMP DEFAULT now()
);

CREATE OR REPLACE FUNCTION update_modified_time_column() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.modified = (now() at time zone 'UTC'); RETURN NEW; END;$$;

CREATE OR REPLACE TRIGGER update_processing_graph_modified_time BEFORE UPDATE ON processing_graph
    FOR EACH ROW EXECUTE PROCEDURE update_modified_time_column();

CREATE TABLE IF NOT EXISTS task (
    uuid UUID default gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    function_string TEXT NOT NULL,
    layer_index INT CHECK ( layer_index > -1 ) NOT NULL,
    processing_graph VARCHAR(255) REFERENCES processing_graph(name) ON DELETE CASCADE NOT NULL,
    is_unique BOOLEAN DEFAULT FALSE,
    concurrency INT DEFAULT 0,
    on_fail_task_id UUID REFERENCES task(uuid) ON DELETE SET DEFAULT DEFAULT NULL,
    created TIMESTAMP DEFAULT now(),
    deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT unique_task_constraint UNIQUE (name, processing_graph, function_string)
);

CREATE TABLE IF NOT EXISTS directional_task_graph_map (
    task_id UUID REFERENCES task(uuid) ON DELETE CASCADE NOT NULL,
    predecessor_task_id UUID REFERENCES task(uuid) ON DELETE CASCADE NOT NULL,
    created TIMESTAMP DEFAULT now(),
    PRIMARY KEY (task_id, predecessor_task_id)
);

CREATE TABLE  IF NOT EXISTS deputy_task_map (
    task_id UUID REFERENCES task(uuid) ON DELETE CASCADE NOT NULL,
    deputy_task_id UUID REFERENCES task(uuid) ON DELETE CASCADE NOT NULL,
    created TIMESTAMP DEFAULT now(),
    PRIMARY KEY (task_id, deputy_task_id)
);

CREATE TABLE IF NOT EXISTS routine (
    uuid UUID default gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    processing_graph VARCHAR(255) REFERENCES processing_graph(name) ON DELETE CASCADE NOT NULL,
    created TIMESTAMP DEFAULT now(),
    deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT unique_routine_constraint UNIQUE (name, processing_graph)
);

CREATE TABLE IF NOT EXISTS task_to_routine_map (
    task_id UUID REFERENCES task(uuid) ON DELETE CASCADE NOT NULL ,
    routine_id UUID REFERENCES routine(uuid) ON DELETE CASCADE NOT NULL,
    created TIMESTAMP DEFAULT now(),
    PRIMARY KEY (task_id, routine_id)
);

CREATE TABLE IF NOT EXISTS server (
    uuid UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    address TEXT NOT NULL,
    port INT NOT NULL,
    processing_graph VARCHAR(255) REFERENCES processing_graph(name) ON DELETE NO ACTION NOT NULL,
    is_blocked BOOLEAN DEFAULT FALSE,
    is_non_responsive BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created TIMESTAMP DEFAULT now(),
    modified TIMESTAMP DEFAULT now(),
    deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT unique_server_constraint UNIQUE (address, port)
);

CREATE OR REPLACE TRIGGER update_server_modified_time BEFORE UPDATE ON server
    FOR EACH ROW EXECUTE PROCEDURE update_modified_time_column();

CREATE TABLE IF NOT EXISTS server_snapshot (
    server_id UUID REFERENCES server(uuid) ON DELETE CASCADE NOT NULL,
    cpu DECIMAL(3,2) CONSTRAINT check_server_snapshot_cpu CHECK (cpu BETWEEN 0 AND 1) NOT NULL,
    gpu DECIMAL(3,2) CONSTRAINT check_server_snapshot_gpu CHECK (gpu BETWEEN 0 AND 1) DEFAULT 0.00,
    ram BIGINT NOT NULL,
    timestamp TIMESTAMP DEFAULT now(),
    PRIMARY KEY (server_id, timestamp)
);

CREATE TABLE IF NOT EXISTS server_to_server_communication_map (
    server_id UUID REFERENCES server(uuid) ON DELETE CASCADE NOT NULL,
    server_client_id UUID REFERENCES server(uuid) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (server_id, server_client_id)
);

CREATE TABLE IF NOT EXISTS routine_execution (
    uuid UUID PRIMARY KEY,
    server_id UUID REFERENCES server(uuid) ON DELETE NO ACTION NOT NULL,
    routine_id UUID REFERENCES routine(uuid) ON DELETE NO ACTION DEFAULT NULL,
    description TEXT NOT NULL,
    is_scheduled BOOLEAN DEFAULT TRUE,
    is_running BOOLEAN DEFAULT FALSE,
    is_complete BOOLEAN DEFAULT FALSE,
    errored BOOLEAN DEFAULT FALSE,
    failed BOOLEAN DEFAULT FALSE,
    reached_timeout BOOLEAN DEFAULT FALSE,
    request_url TEXT DEFAULT NULL,
    progress DECIMAL(3,2) CONSTRAINT check_routine_execution_progress CHECK ( progress BETWEEN 0 AND 1) DEFAULT 0.00,
    previous_routine_execution UUID REFERENCES routine_execution (uuid) ON DELETE SET DEFAULT DEFAULT NULL,
    created TIMESTAMP DEFAULT now(),
    ended TIMESTAMP DEFAULT NULL,
    deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT unique_routine_execution_constraint UNIQUE (server_id, created)
);

-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS context (
    uuid UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    context JSONB NOT NULL -- encrypt
);

CREATE TABLE IF NOT EXISTS task_execution (
    uuid UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    routine_execution_id UUID REFERENCES routine_execution(uuid) ON DELETE NO ACTION NOT NULL,
    task_id UUID REFERENCES task(uuid) ON DELETE NO ACTION NOT NULL,
    context_id UUID REFERENCES context(uuid) ON DELETE NO ACTION NOT NULL,
    is_scheduled BOOLEAN DEFAULT TRUE,
    is_running BOOLEAN DEFAULT FALSE,
    is_complete BOOLEAN DEFAULT FALSE,
    errored BOOLEAN DEFAULT FALSE,
    failed BOOLEAN DEFAULT FALSE,
    reached_timeout BOOLEAN DEFAULT FALSE,
    progress DECIMAL(3,2) CONSTRAINT check_task_execution_progress CHECK ( progress BETWEEN 0 AND 1) DEFAULT 0.00,
    created TIMESTAMP DEFAULT now(),
    started TIMESTAMP DEFAULT NULL,
    ended TIMESTAMP DEFAULT NULL,
    deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT unique_task_execution UNIQUE (routine_execution_id, task_id, context_id)
);

CREATE TABLE IF NOT EXISTS task_execution_map (
    task_execution_id UUID REFERENCES task_execution(uuid) ON DELETE CASCADE NOT NULL,
    previous_task_execution_id UUID REFERENCES task_execution(uuid) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (task_execution_id, previous_task_execution_id)
);


-- TEST DATA

DELETE FROM task_execution_map;
DELETE FROM task_to_routine_map;
DELETE FROM task_execution;
DELETE FROM routine_execution;
DELETE FROM server_to_server_communication_map;
DELETE FROM server_snapshot;
DELETE FROM server;
DELETE FROM directional_task_graph_map;
DELETE FROM deputy_task_map;
DELETE FROM task;
DELETE FROM routine;
DELETE FROM context;
DELETE FROM processing_graph;

INSERT INTO processing_graph (name, description) VALUES ('Stock service', 'This graph has the responsibility to handel all processes related to Stock service.');
INSERT INTO server (uuid, processing_graph, address, port) VALUES ('6076290e-13c0-4b55-b2fb-f7af02697604', 'Stock service', '192.1.2.3', '80');

INSERT INTO processing_graph (name, description) VALUES ('Order service', 'This graph has the responsibility to handel all processes related to Order service.');
INSERT INTO server (uuid, processing_graph, address, port) VALUES ('cf19bfd9-05cb-449f-9883-4108e4c95222', 'Order service', '192.1.3.2', '80');
INSERT INTO server (uuid, processing_graph, address, port, is_non_responsive) VALUES ('59c081ce-49fe-46b6-939b-ac96222d0044', 'Order service', '192.2.3.2', '80', true);

INSERT INTO processing_graph (name, description) VALUES ('Payment service', 'This graph has the responsibility to handel all processes related to Payment service.');
INSERT INTO server (uuid, processing_graph, address, port) VALUES ('32a62276-832b-428b-871d-0b10982ff279', 'Payment service', '192.1.3.3', '80');
INSERT INTO server (uuid, processing_graph, address, port) VALUES ('fb4b435d-c57d-4098-8080-7542caf258b0', 'Payment service', '192.2.3.3', '80');

INSERT INTO processing_graph (name, description) VALUES ('Shipping service', 'This graph has the responsibility to handel all processes related to Shipping service.');
INSERT INTO server (uuid, processing_graph, address, port) VALUES ('93c6da6f-69e3-4aed-80f4-91461dad698b', 'Shipping service', '192.1.2.2', '80');

INSERT INTO processing_graph (name, description) VALUES ('Customer communication service', 'This graph has the responsibility to handel all processes related to Costumer communication service.');
INSERT INTO server (uuid, processing_graph, address, port) VALUES ('1fa5514f-695f-4c89-b709-ba7b161f8d81', 'Customer communication service', '192.1.1.2', '80');
INSERT INTO server (uuid, processing_graph, address, port, is_active) VALUES ('143d74cd-9a21-4c52-883f-dc14e39aefed', 'Customer communication service', '192.2.1.2', '80', false);

--
INSERT INTO server_to_server_communication_map(server_id, server_client_id)
VALUES (
           '32a62276-832b-428b-871d-0b10982ff279',
           'cf19bfd9-05cb-449f-9883-4108e4c95222'
       );

INSERT INTO server_to_server_communication_map(server_id, server_client_id)
VALUES (
           'fb4b435d-c57d-4098-8080-7542caf258b0',
           'cf19bfd9-05cb-449f-9883-4108e4c95222'
       );

INSERT INTO server_to_server_communication_map(server_id, server_client_id)
VALUES (
           '32a62276-832b-428b-871d-0b10982ff279',
           '59c081ce-49fe-46b6-939b-ac96222d0044'
       );

INSERT INTO server_to_server_communication_map(server_id, server_client_id)
VALUES (
           'fb4b435d-c57d-4098-8080-7542caf258b0',
           '59c081ce-49fe-46b6-939b-ac96222d0044'
       );

--
INSERT INTO server_to_server_communication_map(server_id, server_client_id)
VALUES (
           '93c6da6f-69e3-4aed-80f4-91461dad698b',
           'cf19bfd9-05cb-449f-9883-4108e4c95222'
       );

INSERT INTO server_to_server_communication_map(server_id, server_client_id)
VALUES (
           '93c6da6f-69e3-4aed-80f4-91461dad698b',
           '59c081ce-49fe-46b6-939b-ac96222d0044'
       );

--
INSERT INTO server_to_server_communication_map(server_id, server_client_id)
VALUES (
           '1fa5514f-695f-4c89-b709-ba7b161f8d81',
           'cf19bfd9-05cb-449f-9883-4108e4c95222'
       );

INSERT INTO server_to_server_communication_map(server_id, server_client_id)
VALUES (
           '143d74cd-9a21-4c52-883f-dc14e39aefed',
           'cf19bfd9-05cb-449f-9883-4108e4c95222'
       );

INSERT INTO server_to_server_communication_map(server_id, server_client_id)
VALUES (
           '1fa5514f-695f-4c89-b709-ba7b161f8d81',
           '59c081ce-49fe-46b6-939b-ac96222d0044'
       );

INSERT INTO server_to_server_communication_map(server_id, server_client_id)
VALUES (
           '143d74cd-9a21-4c52-883f-dc14e39aefed',
           '59c081ce-49fe-46b6-939b-ac96222d0044'
       );

--
INSERT INTO server_to_server_communication_map(server_id, server_client_id)
VALUES (
           '1fa5514f-695f-4c89-b709-ba7b161f8d81',
           '93c6da6f-69e3-4aed-80f4-91461dad698b'
       );

INSERT INTO server_to_server_communication_map(server_id, server_client_id)
VALUES (
           '143d74cd-9a21-4c52-883f-dc14e39aefed',
           '93c6da6f-69e3-4aed-80f4-91461dad698b'
       );

-- Customer communication service

INSERT INTO task (name, description, processing_graph, concurrency, is_unique, layer_index, function_string)
VALUES (
           'Prepare SMS',
           'Prepares the SMS message.',
           'Customer communication service',
           0,
           false,
           0,
           'context.message = dataToMessage(context);\n'||
           'return context;'
       );

INSERT INTO task (name, description, processing_graph, concurrency, is_unique, layer_index, function_string)
VALUES (
           'Send SMS',
           'Sends the SMS message to the user.',
           'Customer communication service',
           10,
           false,
           1,
           'const result = await sendSMS(context);\n' ||
           'if (result.status === "success") {\n' ||
           '    return true;\n' ||
           'else {\n' ||
           '    return false;\n' ||
           '}'
       );

INSERT INTO task (name, description, processing_graph, concurrency, is_unique, layer_index, function_string)
VALUES (
           'Prepare Email',
           'Prepares the Email message.',
           'Customer communication service',
           0,
           false,
           0,
           'context.message = dataToMessage(context);\n'||
           'return context;'
       );

INSERT INTO task (name, description, processing_graph, concurrency, is_unique, layer_index, function_string)
VALUES (
           'Send Email',
           'Sends the Email message to the user.',
           'Customer communication service',
           10,
           false,
           1,
           'const result = await sendEmail(context);\n' ||
           'if (result.status === "success") {\n' ||
           '    return true;\n' ||
           'else {\n' ||
           '    return false;\n' ||
           '}'
       );

INSERT INTO directional_task_graph_map (task_id, predecessor_task_id)
VALUES (
           (SELECT uuid FROM task WHERE name = 'Send SMS'),
           (SELECT uuid FROM task WHERE name = 'Prepare SMS')
       );

INSERT INTO directional_task_graph_map (task_id, predecessor_task_id)
VALUES (
           (SELECT uuid FROM task WHERE name = 'Send Email'),
           (SELECT uuid FROM task WHERE name = 'Prepare Email')
       );

INSERT INTO routine (name, description, processing_graph)
VALUES (
           'Send SMS',
           'Sends an SMS to a user',
           'Customer communication service'
       );

INSERT INTO task_to_routine_map (task_id, routine_id)
VALUES (
           (SELECT uuid FROM task WHERE name = 'Prepare SMS'),
           (SELECT uuid FROM routine WHERE name = 'Send SMS')
       );

INSERT INTO task_to_routine_map (task_id, routine_id)
VALUES (
           (SELECT uuid FROM task WHERE name = 'Send SMS'),
           (SELECT uuid FROM routine WHERE name = 'Send SMS')
       );

INSERT INTO routine (name, description, processing_graph)
VALUES (
           'Send Email',
           'Sends an Email to a user',
           'Customer communication service'
       );

INSERT INTO task_to_routine_map (task_id, routine_id)
VALUES (
           (SELECT uuid FROM task WHERE name = 'Prepare Email'),
           (SELECT uuid FROM routine WHERE name = 'Send Email')
       );

INSERT INTO task_to_routine_map (task_id, routine_id)
VALUES (
           (SELECT uuid FROM task WHERE name = 'Send Email'),
           (SELECT uuid FROM routine WHERE name = 'Send Email')
       );

-- Shipping service

INSERT INTO task (name, description, processing_graph, concurrency, is_unique, layer_index, function_string)
VALUES (
           'Create shipment order',
           'Creates a shipment order in the database.',
           'Shipping service',
           5,
           false,
           0,
           'context.shipmentOrder = await registerShipmentOrder(context);\n' ||
           'return context;'
       );

INSERT INTO task (name, description, processing_graph, concurrency, is_unique, layer_index, function_string)
VALUES (
           'Generate shipment labels',
           'Generates the labels for the shipment.',
           'Shipping service',
           5,
           false,
           1,
           'context.shipmentOrder.shipmentLabel = await generateLabel(context);\n' ||
           'return context;'
       );

INSERT INTO task (name, description, processing_graph, concurrency, is_unique, layer_index, function_string)
VALUES (
           'Deputy task for "Send Email"',
           'Referencing routine or task with name: "Send Email" in Processing Graph: Customer communication service.',
           'Shipping service',
           5,
           false,
           2,
           ''
       );

INSERT INTO directional_task_graph_map (task_id, predecessor_task_id)
VALUES (
           (SELECT uuid FROM task WHERE name = 'Generate shipment labels'),
           (SELECT uuid FROM task WHERE name = 'Create shipment order')
       );

INSERT INTO directional_task_graph_map (task_id, predecessor_task_id)
VALUES (
           (SELECT uuid FROM task WHERE name = 'Deputy task for "Send Email"'),
           (SELECT uuid FROM task WHERE name = 'Generate shipment labels')
       );

INSERT INTO deputy_task_map (task_id, deputy_task_id)
VALUES (
           (SELECT uuid FROM task WHERE name = 'Deputy task for "Send Email"' AND processing_graph = 'Shipping service'),
           (SELECT uuid from task WHERE name = 'Prepare Email')
       );

-- Payment service

INSERT INTO task (name, description, processing_graph, concurrency, is_unique, layer_index, function_string)
VALUES (
           'Format order',
           'Formats order for payment gateway compatibility. (Old)',
           'Payment service',
           0,
           false,
           0,
           'return {\n    paymentDetails: {\n        amount: context.order.totalAmount,\n        currency: context.order.currency,\n    },\n}'
       );

INSERT INTO task (name, description, processing_graph, concurrency, is_unique, layer_index, function_string)
VALUES (
           'Format order',
           'Formats order for payment gateway compatibility.',
           'Payment service',
           0,
           false,
           0,
           'return {\n    paymentDetails: {\n        amount: context.order.totalAmount,\n        currency: context.order.currency,\n        description: context.order.description,\n    },\n}'
       );

INSERT INTO task (name, description, processing_graph, concurrency, is_unique, layer_index, function_string)
VALUES (
           'Create transaction record',
           'Creates a transaction record on the database in INITIATED state.',
           'Payment service',
           5,
           false,
           1,
           'await createTransaction(context);'
       );

INSERT INTO task (name, description, processing_graph, concurrency, is_unique, layer_index, function_string)
VALUES (
           'Update transaction record',
           'Updates transaction record on the database to PAID state.',
           'Payment service',
           5,
           false,
           3,
           'await updateTransaction(context);\n' ||
           'return {...context, orderPaid: true};'
       );

INSERT INTO directional_task_graph_map (task_id, predecessor_task_id)
VALUES (
           (SELECT uuid FROM task WHERE name = 'Create transaction record'),
           (SELECT uuid FROM task WHERE name = 'Format order' AND description = 'Formats order for payment gateway compatibility.')
       );

INSERT INTO directional_task_graph_map (task_id, predecessor_task_id)
VALUES (
           (SELECT uuid FROM task WHERE name = 'Create transaction record'),
           (SELECT uuid FROM task WHERE name = 'Format order' AND description = 'Formats order for payment gateway compatibility. (Old)')
       );

INSERT INTO routine (name, description, processing_graph)
VALUES (
           'Pay order',
           'Takes care of the payment gateway logic.',
           'Payment service'
       );

INSERT INTO task_to_routine_map (task_id, routine_id)
VALUES (
           (SELECT uuid FROM task WHERE name = 'Format order' AND description = 'Formats order for payment gateway compatibility.'),
           (SELECT uuid FROM routine WHERE name = 'Pay order')
       );

INSERT INTO task_to_routine_map (task_id, routine_id)
VALUES (
           (SELECT uuid FROM task WHERE name = 'Format order' AND description = 'Formats order for payment gateway compatibility. (Old)'),
           (SELECT uuid FROM routine WHERE name = 'Pay order')
       );

INSERT INTO task_to_routine_map (task_id, routine_id)
VALUES (
           (SELECT uuid FROM task WHERE name = 'Create transaction record'),
           (SELECT uuid FROM routine WHERE name = 'Pay order')
       );

INSERT INTO task_to_routine_map (task_id, routine_id)
VALUES (
           (SELECT uuid FROM task WHERE name = 'Update transaction record'),
           (SELECT uuid FROM routine WHERE name = 'Pay order')
       );

-- Order service

INSERT INTO task (name, description, processing_graph, concurrency, is_unique, layer_index, function_string)
VALUES (
           'Create order',
           'Creates a new order with a pending state in the database.',
           'Order service',
           5,
           false,
           0,
           'context.order = await createOrder(context);'
       );

INSERT INTO task (name, description, processing_graph, concurrency, is_unique, layer_index, function_string)
VALUES (
           'On failed order',
           'Changes the order state to FAILED in database.',
           'Order service',
           5,
           false,
           3,
           'context.order = await failOrder(context);'
       );

-- Circle back
INSERT INTO task (name, description, processing_graph, concurrency, is_unique, layer_index, function_string)
VALUES (
           'Deputy task for "On failed order"',
           'Referencing routine or task with name: "On failed order" in Processing Graph: Order service.',
           'Payment service',
           5,
           false,
           3,
           ''
       );

INSERT INTO task (name, description, processing_graph, concurrency, is_unique, layer_index, function_string, on_fail_task_id)
VALUES (
           'Send payment request',
           'Makes an API request to the payment provider.',
           'Payment service',
           5,
           false,
           2,
           'const result = await makePayment(context.paymentDetails);\n' ||
           'if (result.status === "success") {\n' ||
           '    context.transactionId = result.transactionId;\n' ||
           '    return context;\n' ||
           'if (result.status === "pending") {\n' ||
           '    while (true) {\n' ||
           '        const res = await makePayment(context.paymentDetails);\n' ||
           '        if (res.status === "success") {\n' ||
           '            context.transactionId = result.transactionId;\n' ||
           '            return context;\n' ||
           '        } else if (res.status === "failed") {\n' ||
           '            context.failed = true;\n' ||
           '            return context;\n' ||
           '        }\n' ||
           '    }\n' ||
           'else {\n' ||
           '    context.failed = true;\n' ||
           '    return context;\n' ||
           '}',
           (SELECT uuid FROM task WHERE name = 'Deputy task for "On failed order"')
       );

INSERT INTO directional_task_graph_map (task_id, predecessor_task_id)
VALUES (
           (SELECT uuid FROM task WHERE name = 'Send payment request'),
           (SELECT uuid FROM task WHERE name = 'Create transaction record')
       );

INSERT INTO directional_task_graph_map (task_id, predecessor_task_id)
VALUES (
           (SELECT uuid FROM task WHERE name = 'Update transaction record'),
           (SELECT uuid FROM task WHERE name = 'Send payment request')
       );

INSERT INTO deputy_task_map (task_id, deputy_task_id)
VALUES (
           (SELECT uuid FROM task WHERE name = 'Deputy task for "On failed order"'),
           (SELECT uuid from task WHERE name = 'On failed order')
       );

INSERT INTO task_to_routine_map (task_id, routine_id)
VALUES (
           (SELECT uuid FROM task WHERE name = 'Send payment request'),
           (SELECT uuid FROM routine WHERE name = 'Pay order')
       );
--

INSERT INTO task (name, description, processing_graph, concurrency, is_unique, layer_index, function_string, on_fail_task_id)
VALUES (
           'Validate order details',
           'Validates the details of the new order.',
           'Order service',
           0,
           false,
           1,
           'if (context.order.finalPrice !== context.order.originalPrice - context.order.discount) {\n' ||
           '    context.failed = true;\n' ||
           '}',
           (SELECT uuid FROM task WHERE name = 'On failed order')
       );

INSERT INTO task (name, description, processing_graph, concurrency, is_unique, layer_index, function_string, on_fail_task_id)
VALUES (
           'Validate shipping details',
           'Validates the shipping details of the new order.',
           'Order service',
           0,
           false,
           2,
           'if (context.order.finalPrice !== context.order.originalPrice - context.order.discount) {\n' ||
           '    context.failed = true;\n' ||
           '}',
           (SELECT uuid FROM task WHERE name = 'On failed order')
       );

INSERT INTO task (name, description, processing_graph, concurrency, is_unique, layer_index, function_string)
VALUES (
           'Split order items',
           'Splits the order items for reservation.',
           'Order service',
           0,
           false,
           3,
           'for (const item of context.order.items) {\n' ||
           '    yield {...context, item}\n' ||
           '}'
       );

INSERT INTO task (name, description, processing_graph, concurrency, is_unique, layer_index, function_string)
VALUES (
           'Reserve item',
           'Reserve a number of a specific item.',
           'Order service',
           5,
           false,
           4,
           'context.item.reserved = await reserveItem(context.item.id, context.item.amount)'
       );

INSERT INTO task (name, description, processing_graph, concurrency, is_unique, layer_index, function_string)
VALUES (
           'Gather reservation results',
           'Gathers the result of the item reservations.',
           'Order service',
           0,
           true,
           5,
           'delete context[0].item;\n' ||
           'return context[0]'
       );

INSERT INTO task (name, description, processing_graph, concurrency, is_unique, layer_index, function_string)
VALUES (
           'Deputy task for "Pay order"',
           'Referencing routine or task with name: "Pay order" in Processing Graph: Payment service.',
           'Order service',
           5,
           false,
           6,
           ''
       );

INSERT INTO task (name, description, processing_graph, concurrency, is_unique, layer_index, function_string)
VALUES (
           'Confirm payment',
           'Checks and confirms order and updates database.',
           'Order service',
           5,
           false,
           7,
           'if (context.orderPaid) {\n' ||
           '    await confirmOrder(context);' ||
           '    return true;\n' ||
           '}\n\n' ||
           'return false;'
       );

INSERT INTO task (name, description, processing_graph, concurrency, is_unique, layer_index, function_string)
VALUES (
           'Deputy task for "Send SMS"',
           'Referencing routine or task with name: "Send SMS" in Processing Graph: Customer communication service.',
           'Order service',
           5,
           false,
           8,
           ''
       );

INSERT INTO task (name, description, processing_graph, concurrency, is_unique, layer_index, function_string)
VALUES (
           'Deputy task for "Send Email"',
           'Referencing routine or task with name: "Send Email" in Processing Graph: Customer communication service.',
           'Order service',
           5,
           false,
           8,
           ''
       );

INSERT INTO task (name, description, processing_graph, concurrency, is_unique, layer_index, function_string)
VALUES (
           'Deputy task for "Create shipment order"',
           'Referencing routine or task with name: "Create shipment order" in Processing Graph: Shipment service.',
           'Order service',
           5,
           false,
           8,
           ''
       );

INSERT INTO directional_task_graph_map (task_id, predecessor_task_id)
VALUES (
           (SELECT uuid FROM task WHERE name = 'Validate order details'),
           (SELECT uuid FROM task WHERE name = 'Create order')
       );

INSERT INTO directional_task_graph_map (task_id, predecessor_task_id)
VALUES (
           (SELECT uuid FROM task WHERE name = 'Validate shipping details'),
           (SELECT uuid FROM task WHERE name = 'Validate order details')
       );

INSERT INTO directional_task_graph_map (task_id, predecessor_task_id)
VALUES (
           (SELECT uuid FROM task WHERE name = 'Split order items'),
           (SELECT uuid FROM task WHERE name = 'Validate shipping details')
       );

INSERT INTO directional_task_graph_map (task_id, predecessor_task_id)
VALUES (
           (SELECT uuid FROM task WHERE name = 'Reserve item'),
           (SELECT uuid FROM task WHERE name = 'Split order items')
       );

INSERT INTO directional_task_graph_map (task_id, predecessor_task_id)
VALUES (
           (SELECT uuid FROM task WHERE name = 'Gather reservation results'),
           (SELECT uuid FROM task WHERE name = 'Reserve item')
       );

INSERT INTO directional_task_graph_map (task_id, predecessor_task_id)
VALUES (
           (SELECT uuid FROM task WHERE name = 'Deputy task for "Pay order"'),
           (SELECT uuid FROM task WHERE name = 'Gather reservation results')
       );

INSERT INTO directional_task_graph_map (task_id, predecessor_task_id)
VALUES (
           (SELECT uuid FROM task WHERE name = 'Confirm payment'),
           (SELECT uuid FROM task WHERE name = 'Deputy task for "Pay order"')
       );

INSERT INTO directional_task_graph_map (task_id, predecessor_task_id)
VALUES (
           (SELECT uuid FROM task WHERE name = 'Deputy task for "Send SMS"'),
           (SELECT uuid FROM task WHERE name = 'Confirm payment')
       );

INSERT INTO directional_task_graph_map (task_id, predecessor_task_id)
VALUES (
           (SELECT uuid FROM task WHERE name = 'Deputy task for "Send Email"' AND processing_graph = 'Order service'),
           (SELECT uuid FROM task WHERE name = 'Confirm payment')
       );

INSERT INTO directional_task_graph_map (task_id, predecessor_task_id)
VALUES (
           (SELECT uuid FROM task WHERE name = 'Deputy task for "Create shipment order"'),
           (SELECT uuid FROM task WHERE name = 'Confirm payment')
       );

INSERT INTO deputy_task_map (task_id, deputy_task_id)
VALUES (
           (SELECT uuid FROM task WHERE name = 'Deputy task for "Pay order"'),
           (SELECT uuid FROM task WHERE name = 'Format order' ORDER BY created DESC LIMIT 1)
       );

INSERT INTO deputy_task_map (task_id, deputy_task_id)
VALUES (
           (SELECT uuid FROM task WHERE name = 'Deputy task for "Send SMS"'),
           (SELECT uuid from task WHERE name = 'Prepare SMS')
       );

INSERT INTO deputy_task_map (task_id, deputy_task_id)
VALUES (
           (SELECT uuid FROM task WHERE name = 'Deputy task for "Send Email"' AND processing_graph = 'Order service'),
           (SELECT uuid from task WHERE name = 'Prepare Email')
       );

INSERT INTO deputy_task_map (task_id, deputy_task_id)
VALUES (
           (SELECT uuid FROM task WHERE name = 'Deputy task for "Create shipment order"'),
           (SELECT uuid from task WHERE name = 'Create shipment order')
       );

-- Stock service

INSERT INTO task (name, description, processing_graph, concurrency, is_unique, layer_index, function_string)
VALUES (
            'Split chart items',
            'Split items for individual availability checks.',
            'Stock service',
            0,
            false,
            0,
            'for (const item of context.chart.items) {\n' ||
            '    yield {...context, item };\n' ||
            '}'
       );

INSERT INTO task (name, description, processing_graph, concurrency, is_unique, layer_index, function_string)
VALUES (
           'Check availability of item',
           'Checks database for item availability and updates context.',
           'Stock service',
           5,
           false,
           1,
           'context.item.available = await checkAvailability(context.item);'
       );

INSERT INTO task (name, description, processing_graph, concurrency, is_unique, layer_index, function_string)
VALUES (
           'On fail availability',
           'Adds info to context if availability check fails.',
           'Stock service',
           0,
           false,
           3,
           'context.item.available = await checkAvailability(context.item);'
       );

INSERT INTO task (name, description, processing_graph, concurrency, is_unique, layer_index, function_string, on_fail_task_id)
VALUES (
           'Gather items availability results',
           'Check if all items were available.',
           'Stock service',
           0,
           true,
           2,
           'const newContext = {...context[0]};' ||
           'for (const itemContext of context) {\n' ||
           '    newContext.chart.items.push(itemContext.item);\n' ||
           '    if (!itemContext.item.available) {\n' ||
           '        newContext.failed = true;\n' ||
           '        return newContext;\n' ||
           '    }' ||
           '}\n\n' ||
           'return newContext.proceedToOrderCreation ? newContext : false;',
           (SELECT uuid FROM task WHERE name = 'On fail availability')
       );

INSERT INTO directional_task_graph_map (task_id, predecessor_task_id)
VALUES (
        (SELECT uuid FROM task WHERE name = 'Check availability of item'),
        (SELECT uuid FROM task WHERE name = 'Split chart items')
       );

INSERT INTO directional_task_graph_map (task_id, predecessor_task_id)
VALUES (
           (SELECT uuid FROM task WHERE name = 'Gather items availability results'),
           (SELECT uuid FROM task WHERE name = 'Check availability of item')
       );

INSERT INTO routine (name, description, processing_graph)
VALUES (
        'Check availability of chart items',
        'Checks the availability of each item in the shopping chart.',
        'Stock service'
       );

INSERT INTO task_to_routine_map (task_id, routine_id)
VALUES (
        (SELECT uuid FROM task WHERE name = 'Split chart items'),
        (SELECT uuid FROM routine WHERE name = 'Check availability of chart items')
        );

INSERT INTO task_to_routine_map (task_id, routine_id)
VALUES (
           (SELECT uuid FROM task WHERE name = 'Check availability of item'),
           (SELECT uuid FROM routine WHERE name = 'Check availability of chart items')
       );

INSERT INTO task_to_routine_map (task_id, routine_id)
VALUES (
           (SELECT uuid FROM task WHERE name = 'Gather items availability results'),
           (SELECT uuid FROM routine WHERE name = 'Check availability of chart items')
       );



-- Execution Test data --

-- Routine executions --

-- Check availability of chart items

-- completed records
INSERT INTO routine_execution
    (SELECT
         gen_random_uuid() AS uuid,
         '6076290e-13c0-4b55-b2fb-f7af02697604' AS server_id,
         (SELECT uuid FROM routine WHERE name = 'Check availability of chart items') AS routine_id,
         'Check availability of chart items' AS description,
         true AS is_scheduled,
         true AS is_running,
         true AS is_complete,
         false AS errored,
         false AS failed,
         false AS reached_timeout,
         null AS request_url,
         1.00 AS progress,
         null AS previous_routine_execution,
         now() - '1 week ago'::interval * random() as created,
         null as ended,
         false as deleted
    FROM generate_series(1, 200) as g);

-- running records
INSERT INTO routine_execution
    (SELECT
         gen_random_uuid() AS uuid,
         '6076290e-13c0-4b55-b2fb-f7af02697604' AS server_id,
         (SELECT uuid FROM routine WHERE name = 'Check availability of chart items') AS routine_id,
         'Check availability of chart items' AS description,
         true AS is_scheduled,
         true AS is_running,
         false AS is_complete,
         false AS errored,
         false AS failed,
         false AS reached_timeout,
         null AS request_url,
         random() AS progress,
         null AS previous_routine_execution,
         now() - '1 minute ago'::interval * random() as created,
         null as ended,
         false as deleted
     FROM generate_series(1, 5) as g);

-- scheduled records
INSERT INTO routine_execution
    (SELECT
         gen_random_uuid() AS uuid,
         '6076290e-13c0-4b55-b2fb-f7af02697604' AS server_id,
         (SELECT uuid FROM routine WHERE name = 'Check availability of chart items') AS routine_id,
         'Check availability of chart items' AS description,
         true AS is_scheduled,
         false AS is_running,
         false AS is_complete,
         false AS errored,
         false AS failed,
         false AS reached_timeout,
         null AS request_url,
         0.00 AS progress,
         null AS previous_routine_execution,
         now() - '10 seconds ago'::interval * random() as created,
         null as ended,
         false as deleted
     FROM generate_series(1, 3) as g);

-- Create order

-- completed records
INSERT INTO routine_execution
    (SELECT
         gen_random_uuid() AS uuid,
         ('{cf19bfd9-05cb-449f-9883-4108e4c95222,59c081ce-49fe-46b6-939b-ac96222d0044}'::uuid[])[ceil(random()*2)] AS server_id,
         null AS routine_id,
         'Create order' AS description,
         true AS is_scheduled,
         true AS is_running,
         true AS is_complete,
         false AS errored,
         false AS failed,
         false AS reached_timeout,
         null AS request_url,
         1.00 AS progress,
         null AS previous_routine_execution,
         now() - '1 week ago'::interval * random() as created,
         null as ended,
         false as deleted
     FROM generate_series(1, 100) as g);

-- running records
INSERT INTO routine_execution
    (SELECT
         gen_random_uuid() AS uuid,
         'cf19bfd9-05cb-449f-9883-4108e4c95222' AS server_id,
         null AS routine_id,
         'Create order' AS description,
         true AS is_scheduled,
         true AS is_running,
         false AS is_complete,
         false AS errored,
         false AS failed,
         false AS reached_timeout,
         null AS request_url,
         random() AS progress,
         null AS previous_routine_execution,
         now() - '1 minute ago'::interval * random() as created,
         null as ended,
         false as deleted
     FROM generate_series(1, 5) as g);

-- scheduled records
INSERT INTO routine_execution
    (SELECT
         gen_random_uuid() AS uuid,
         'cf19bfd9-05cb-449f-9883-4108e4c95222' AS server_id,
         null AS routine_id,
         'Create order' AS description,
         true AS is_scheduled,
         false AS is_running,
         false AS is_complete,
         false AS errored,
         false AS failed,
         false AS reached_timeout,
         null AS request_url,
         0.00 AS progress,
         null AS previous_routine_execution,
         now() - '10 seconds ago'::interval * random() as created,
         null as ended,
         false as deleted
     FROM generate_series(1, 3) as g);

-- random duration
UPDATE routine_execution SET ended = created + '1 minute'::interval * random() + '5 seconds'::interval WHERE is_complete = true;

-- edge cases
UPDATE routine_execution SET deleted = random() > 0.996 WHERE is_complete = true;
UPDATE routine_execution SET failed = random() > 0.995 WHERE is_complete = true;
UPDATE routine_execution SET errored = random() < 0.004 WHERE is_complete = true;
UPDATE routine_execution SET reached_timeout = random() < 0.004 WHERE is_complete = true;
UPDATE routine_execution SET ended = created + '2 minute'::interval WHERE reached_timeout = true;

-- Pay order
DO
$$
    DECLARE
        rec record;
        routine_uuid uuid = (SELECT uuid FROM routine WHERE name = 'Pay order');
    BEGIN
        -- completed records
        FOR rec IN SELECT * FROM routine_execution WHERE description = 'Create order' AND is_complete = true AND errored = false AND
                                                            failed = false AND reached_timeout = false
            LOOP
                INSERT INTO routine_execution (uuid, server_id, routine_id, description, is_scheduled, is_running, is_complete, errored,
                                               failed, reached_timeout, request_url, progress, previous_routine_execution, created, ended, deleted)
                VALUES (
                           gen_random_uuid(),
                           ('{32a62276-832b-428b-871d-0b10982ff279,fb4b435d-c57d-4098-8080-7542caf258b0}'::uuid[])[ceil(random()*2)],
                           routine_uuid,
                           'Pay order',
                           rec.is_scheduled,
                           rec.is_running,
                           rec.is_complete,
                           rec.errored,
                           rec.failed,
                           rec.reached_timeout,
                           rec.request_url,
                           rec.progress,
                           rec.uuid,
                           rec.created + '2 seconds'::interval * random() + '1 second'::interval,
                           rec.ended - '2 seconds'::interval * random() - '1 second'::interval,
                           rec.deleted
                       );
            END LOOP;

        FOR rec IN SELECT * FROM routine_execution WHERE description = 'Create order' AND is_running = true AND is_complete = false ORDER BY uuid LIMIT 2
            LOOP
                INSERT INTO routine_execution (uuid, server_id, routine_id, description, is_scheduled, is_running, is_complete, errored,
                                               failed, reached_timeout, request_url, progress, previous_routine_execution, created, ended, deleted)
                VALUES (
                           gen_random_uuid(),
                           ('{32a62276-832b-428b-871d-0b10982ff279,fb4b435d-c57d-4098-8080-7542caf258b0}'::uuid[])[ceil(random()*2)],
                           routine_uuid,
                           'Pay order',
                           rec.is_scheduled,
                           rec.is_running,
                           true,
                           rec.errored,
                           rec.failed,
                           rec.reached_timeout,
                           rec.request_url,
                           1.00,
                           rec.uuid,
                           rec.created + '2 seconds'::interval * random() + '1 second'::interval,
                           rec.ended - '2 seconds'::interval * random() - '1 second'::interval,
                           rec.deleted
                       );
            END LOOP;

        -- running records
        FOR rec IN SELECT * FROM routine_execution WHERE description = 'Create order' AND is_running = true AND is_complete = false ORDER BY uuid DESC LIMIT 2
            LOOP
                INSERT INTO routine_execution (uuid, server_id, routine_id, description, is_scheduled, is_running, is_complete, errored,
                                               failed, reached_timeout, request_url, progress, previous_routine_execution, created, ended, deleted)
                VALUES (
                           gen_random_uuid(),
                           ('{32a62276-832b-428b-871d-0b10982ff279,fb4b435d-c57d-4098-8080-7542caf258b0}'::uuid[])[ceil(random()*2)],
                           routine_uuid,
                           'Pay order',
                           rec.is_scheduled,
                           rec.is_running,
                           rec.is_complete,
                           rec.errored,
                           rec.failed,
                           rec.reached_timeout,
                           rec.request_url,
                           random(),
                           rec.uuid,
                           rec.created + '2 seconds'::interval * random() + '1 second'::interval,
                           null,
                           rec.deleted
                       );
            END LOOP;

        -- edge cases
        FOR rec IN SELECT * FROM routine_execution WHERE description = 'Create order' AND errored = true LIMIT 3
            LOOP
                INSERT INTO routine_execution (uuid, server_id, routine_id, description, is_scheduled, is_running, is_complete, errored,
                                               failed, reached_timeout, request_url, progress, previous_routine_execution, created, ended, deleted)
                VALUES (
                           gen_random_uuid(),
                           ('{32a62276-832b-428b-871d-0b10982ff279,fb4b435d-c57d-4098-8080-7542caf258b0}'::uuid[])[ceil(random()*2)],
                           routine_uuid,
                           'Pay order',
                           rec.is_scheduled,
                           rec.is_running,
                           rec.is_complete,
                           rec.errored,
                           rec.failed,
                           rec.reached_timeout,
                           rec.request_url,
                           rec.progress,
                           rec.uuid,
                           rec.created + '2 seconds'::interval * random() + '1 second'::interval,
                           rec.ended - '2 seconds'::interval * random() - '1 second'::interval,
                           rec.deleted
                       );
            END LOOP;

        FOR rec IN SELECT * FROM routine_execution WHERE description = 'Create order' AND failed = true LIMIT 3
            LOOP
                INSERT INTO routine_execution (uuid, server_id, routine_id, description, is_scheduled, is_running, is_complete, errored,
                                               failed, reached_timeout, request_url, progress, previous_routine_execution, created, ended, deleted)
                VALUES (
                           gen_random_uuid(),
                           ('{32a62276-832b-428b-871d-0b10982ff279,fb4b435d-c57d-4098-8080-7542caf258b0}'::uuid[])[ceil(random()*2)],
                           routine_uuid,
                           'Pay order',
                           rec.is_scheduled,
                           rec.is_running,
                           rec.is_complete,
                           rec.errored,
                           rec.failed,
                           rec.reached_timeout,
                           rec.request_url,
                           rec.progress,
                           rec.uuid,
                           rec.created + '2 seconds'::interval * random() + '1 second'::interval,
                           rec.ended - '2 seconds'::interval * random() - '1 second'::interval,
                           rec.deleted
                       );
            END LOOP;

        FOR rec IN SELECT * FROM routine_execution WHERE description = 'Create order' AND reached_timeout = true
            LOOP
                INSERT INTO routine_execution (uuid, server_id, routine_id, description, is_scheduled, is_running, is_complete, errored,
                                               failed, reached_timeout, request_url, progress, previous_routine_execution, created, ended, deleted)
                VALUES (
                           gen_random_uuid(),
                           ('{32a62276-832b-428b-871d-0b10982ff279,fb4b435d-c57d-4098-8080-7542caf258b0}'::uuid[])[ceil(random()*2)],
                           routine_uuid,
                           'Pay order',
                           rec.is_scheduled,
                           rec.is_running,
                           rec.is_complete,
                           rec.errored,
                           rec.failed,
                           rec.reached_timeout,
                           rec.request_url,
                           rec.progress,
                           rec.uuid,
                           rec.created + '2 seconds'::interval * random() + '1 second'::interval,
                           rec.ended - '2 seconds'::interval * random() - '1 second'::interval,
                           rec.deleted
                       );
            END LOOP;
    END
$$;

-- Create shipment order
DO
$$
    DECLARE
        rec record;
    BEGIN
        -- completed records
        FOR rec IN SELECT * FROM routine_execution WHERE description = 'Create order' AND is_complete = true AND errored = false AND
                failed = false AND reached_timeout = false
            LOOP
                INSERT INTO routine_execution (uuid, server_id, routine_id, description, is_scheduled, is_running, is_complete, errored,
                                               failed, reached_timeout, request_url, progress, previous_routine_execution, created, ended, deleted)
                VALUES (
                           gen_random_uuid(),
                           '93c6da6f-69e3-4aed-80f4-91461dad698b',
                           null,
                           'Create shipment order',
                           rec.is_scheduled,
                           rec.is_running,
                           rec.is_complete,
                           rec.errored,
                           rec.failed,
                           rec.reached_timeout,
                           rec.request_url,
                           rec.progress,
                           rec.uuid,
                           (SELECT ended FROM routine_execution WHERE previous_routine_execution = rec.uuid AND description = 'Pay order') + '20 milliseconds'::interval,
                           rec.ended - '20 milliseconds'::interval,
                           rec.deleted
                       );
            END LOOP;

        -- running records
        FOR rec IN SELECT * FROM routine_execution WHERE description = 'Create order' AND is_running = true AND is_complete = false ORDER BY uuid LIMIT 1
            LOOP
                INSERT INTO routine_execution (uuid, server_id, routine_id, description, is_scheduled, is_running, is_complete, errored,
                                               failed, reached_timeout, request_url, progress, previous_routine_execution, created, ended, deleted)
                VALUES (
                           gen_random_uuid(),
                           '93c6da6f-69e3-4aed-80f4-91461dad698b',
                           null,
                           'Create shipment order',
                           rec.is_scheduled,
                           rec.is_running,
                           rec.is_complete,
                           rec.errored,
                           rec.failed,
                           rec.reached_timeout,
                           rec.request_url,
                           random(),
                           rec.uuid,
                           (SELECT ended FROM routine_execution WHERE previous_routine_execution = rec.uuid AND description = 'Pay order') + '20 milliseconds'::interval,
                           null,
                           rec.deleted
                       );
            END LOOP;
    END
$$;

-- Send SMS
DO
$$
    DECLARE
        rec record;
        routine_uuid uuid = (SELECT uuid FROM routine WHERE name = 'Send SMS');
    BEGIN
        -- completed records
        FOR rec IN SELECT * FROM routine_execution WHERE description = 'Create order' AND is_complete = true AND errored = false AND
                failed = false AND reached_timeout = false
            LOOP
                INSERT INTO routine_execution (uuid, server_id, routine_id, description, is_scheduled, is_running, is_complete, errored,
                                               failed, reached_timeout, request_url, progress, previous_routine_execution, created, ended, deleted)
                VALUES (
                           gen_random_uuid(),
                           ('{1fa5514f-695f-4c89-b709-ba7b161f8d81,143d74cd-9a21-4c52-883f-dc14e39aefed}'::uuid[])[ceil(random()*2)],
                           routine_uuid,
                           'Send SMS',
                           rec.is_scheduled,
                           rec.is_running,
                           rec.is_complete,
                           rec.errored,
                           rec.failed,
                           rec.reached_timeout,
                           rec.request_url,
                           rec.progress,
                           rec.uuid,
                           (SELECT ended FROM routine_execution WHERE previous_routine_execution = rec.uuid AND description = 'Pay order') + '18 milliseconds'::interval,
                           rec.ended - '1 second'::interval * random(),
                           rec.deleted
                       );
            END LOOP;

        -- running records
        FOR rec IN SELECT * FROM routine_execution WHERE description = 'Create order' AND is_running = true AND is_complete = false ORDER BY uuid LIMIT 1
            LOOP
                INSERT INTO routine_execution (uuid, server_id, routine_id, description, is_scheduled, is_running, is_complete, errored,
                                               failed, reached_timeout, request_url, progress, previous_routine_execution, created, ended, deleted)
                VALUES (
                           gen_random_uuid(),
                           '1fa5514f-695f-4c89-b709-ba7b161f8d81',
                           routine_uuid,
                           'Send SMS',
                           rec.is_scheduled,
                           rec.is_running,
                           rec.is_complete,
                           rec.errored,
                           rec.failed,
                           rec.reached_timeout,
                           rec.request_url,
                           random(),
                           rec.uuid,
                           (SELECT ended FROM routine_execution WHERE previous_routine_execution = rec.uuid AND description = 'Pay order') + '18 milliseconds'::interval,
                           null,
                           rec.deleted
                       );
            END LOOP;
    END
$$;

-- Send Email
DO
$$
    DECLARE
        rec record;
        routine_uuid uuid = (SELECT uuid FROM routine WHERE name = 'Send Email');
    BEGIN
        -- completed records
        FOR rec IN SELECT * FROM routine_execution WHERE description = 'Create order' AND is_complete = true AND errored = false AND
                failed = false AND reached_timeout = false
            LOOP
                INSERT INTO routine_execution (uuid, server_id, routine_id, description, is_scheduled, is_running, is_complete, errored,
                                               failed, reached_timeout, request_url, progress, previous_routine_execution, created, ended, deleted)
                VALUES (
                           gen_random_uuid(),
                           ('{1fa5514f-695f-4c89-b709-ba7b161f8d81,143d74cd-9a21-4c52-883f-dc14e39aefed}'::uuid[])[ceil(random()*2)],
                           routine_uuid,
                           'Send Email',
                           rec.is_scheduled,
                           rec.is_running,
                           rec.is_complete,
                           rec.errored,
                           rec.failed,
                           rec.reached_timeout,
                           rec.request_url,
                           rec.progress,
                           rec.uuid,
                           (SELECT ended FROM routine_execution WHERE previous_routine_execution = rec.uuid AND description = 'Pay order') + '19 milliseconds'::interval,
                           rec.ended - '1 second'::interval * random(),
                           rec.deleted
                       );
            END LOOP;

        FOR rec IN SELECT * FROM routine_execution WHERE description = 'Create shipment order' AND is_complete = true AND errored = false AND
                failed = false AND reached_timeout = false
            LOOP
                INSERT INTO routine_execution (uuid, server_id, routine_id, description, is_scheduled, is_running, is_complete, errored,
                                               failed, reached_timeout, request_url, progress, previous_routine_execution, created, ended, deleted)
                VALUES (
                           gen_random_uuid(),
                           ('{1fa5514f-695f-4c89-b709-ba7b161f8d81,143d74cd-9a21-4c52-883f-dc14e39aefed}'::uuid[])[ceil(random()*2)],
                           routine_uuid,
                           'Send Email',
                           rec.is_scheduled,
                           rec.is_running,
                           rec.is_complete,
                           rec.errored,
                           rec.failed,
                           rec.reached_timeout,
                           rec.request_url,
                           rec.progress,
                           rec.uuid,
                           rec.created + '200 milliseconds'::interval * random() + '100 milliseconds'::interval,
                           rec.ended - '20 milliseconds'::interval * random() - '10 milliseconds'::interval,
                           rec.deleted
                       );
            END LOOP;

        -- running records
        FOR rec IN SELECT * FROM routine_execution WHERE description = 'Create order' AND is_running = true AND is_complete = false ORDER BY uuid LIMIT 1
            LOOP
                INSERT INTO routine_execution (uuid, server_id, routine_id, description, is_scheduled, is_running, is_complete, errored,
                                               failed, reached_timeout, request_url, progress, previous_routine_execution, created, ended, deleted)
                VALUES (
                           gen_random_uuid(),
                           '1fa5514f-695f-4c89-b709-ba7b161f8d81',
                           routine_uuid,
                           'Send Email',
                           rec.is_scheduled,
                           rec.is_running,
                           rec.is_complete,
                           rec.errored,
                           rec.failed,
                           rec.reached_timeout,
                           rec.request_url,
                           random(),
                           rec.uuid,
                           (SELECT ended FROM routine_execution WHERE previous_routine_execution = rec.uuid AND description = 'Pay order') + '19 milliseconds'::interval,
                           null,
                           rec.deleted
                       );
            END LOOP;
    END
$$;

-- On failed order
DO
$$
    DECLARE
        rec record;
    BEGIN
        -- completed records
        FOR rec IN SELECT * FROM routine_execution WHERE description = 'Pay order' AND is_complete = true AND (errored = true OR
                failed = true OR reached_timeout = true)
            LOOP
                INSERT INTO routine_execution (uuid, server_id, routine_id, description, is_scheduled, is_running, is_complete, errored,
                                               failed, reached_timeout, request_url, progress, previous_routine_execution, created, ended, deleted)
                VALUES (
                           gen_random_uuid(),
                           ('{cf19bfd9-05cb-449f-9883-4108e4c95222,59c081ce-49fe-46b6-939b-ac96222d0044}'::uuid[])[ceil(random()*2)],
                           null,
                           'On failed order',
                           rec.is_scheduled,
                           rec.is_running,
                           rec.is_complete,
                           false,
                           false,
                           false,
                           rec.request_url,
                           rec.progress,
                           rec.uuid,
                           rec.ended - '1 second'::interval,
                           rec.ended - '1 second'::interval * random(),
                           rec.deleted
                       );
            END LOOP;
    END
$$;


-- Task executions --

-- Check availability of chart items
DO
$$
    DECLARE
        rec record;
        average_task_duration interval;
        task_record record;
        task_map_record record;
        task_execution_record record;
        context_uuid uuid;
        task_started timestamp;
        prev_task_ended timestamp;
        g record;
    BEGIN
        -- completed records
        FOR rec IN SELECT * FROM routine_execution WHERE description = 'Check availability of chart items' AND is_complete = true AND errored = false AND
                                                                                                               failed = false AND reached_timeout = false
            LOOP
                SELECT rec.created INTO prev_task_ended;
                SELECT (rec.ended - rec.created) / (SELECT count(*) FROM (SELECT * FROM task WHERE task.processing_graph = 'Stock service') AS tasks) INTO average_task_duration;

                FOR task_record IN SELECT * FROM task WHERE task.processing_graph = 'Stock service'
                    LOOP
                        SELECT prev_task_ended + '5 milliseconds'::interval * random() INTO task_started;

                        IF task_record.name LIKE '%Split%' THEN
                            FOR g IN SELECT * FROM generate_series(1, ceil(random()*10)::bigint)
                                LOOP
                                    INSERT INTO context (uuid, context)
                                    VALUES (gen_random_uuid(), '{"testData": true}') RETURNING uuid INTO context_uuid;

                                    INSERT INTO task_execution (uuid, routine_execution_id, task_id, context_id, is_scheduled, is_running,
                                                                is_complete, errored, failed, reached_timeout, progress, created, started, ended, deleted)
                                    VALUES (
                                             gen_random_uuid(),
                                             rec.uuid,
                                             task_record.uuid,
                                             context_uuid,
                                             rec.is_scheduled,
                                             rec.is_running,
                                             rec.is_complete,
                                             rec.errored,
                                             rec.failed,
                                             rec.reached_timeout,
                                             rec.progress,
                                             prev_task_ended + '10 milliseconds'::interval * random(),
                                             task_started,
                                             task_started + average_task_duration * 1.2 * random(),
                                             rec.deleted
                                    ) RETURNING ended INTO prev_task_ended;
                                END LOOP;

                        ELSE
                            INSERT INTO context (uuid, context)
                            VALUES (gen_random_uuid(), '{"testData": true}')RETURNING uuid INTO context_uuid;

                            INSERT INTO task_execution (uuid, routine_execution_id, task_id, context_id, is_scheduled, is_running,
                                                        is_complete, errored, failed, reached_timeout, progress, created, started, ended, deleted)
                            VALUES (
                                        gen_random_uuid(),
                                        rec.uuid,
                                        task_record.uuid,
                                        context_uuid,
                                        rec.is_scheduled,
                                        rec.is_running,
                                        rec.is_complete,
                                        rec.errored,
                                        rec.failed,
                                        rec.reached_timeout,
                                        rec.progress,
                                        prev_task_ended + '10 milliseconds'::interval * random(),
                                        task_started,
                                        task_started + average_task_duration * 1.2 * random(),
                                        rec.deleted
                                   ) RETURNING ended INTO prev_task_ended;
                        END IF;
                    END LOOP;

                FOR task_record IN SELECT * FROM task WHERE task.processing_graph = 'Stock service'
                    LOOP
                        FOR task_map_record IN SELECT * FROM directional_task_graph_map WHERE predecessor_task_id = task_record.uuid
                            LOOP
                                FOR task_execution_record IN SELECT * FROM task_execution WHERE routine_execution_id = rec.uuid AND task_id = task_record.uuid
                                    LOOP
                                        INSERT INTO task_execution_map (task_execution_id, previous_task_execution_id)
                                        (SELECT
                                             uuid,
                                             task_execution_record.uuid
                                        FROM task_execution WHERE routine_execution_id = rec.uuid AND task_id = task_map_record.task_id);
                                    END LOOP;
                            END LOOP;

                    END LOOP;
            END LOOP;
    END
$$;

-- 'Create order'
DO
$$
    DECLARE
        rec record;
        average_task_duration interval;
        task_record record;
        task_map_record record;
        task_execution_record record;
        context_uuid uuid;
        task_started timestamp;
        prev_task_ended timestamp;
        g record;
    BEGIN
        -- completed records
        FOR rec IN SELECT * FROM routine_execution WHERE description = 'Create order' AND is_complete = true AND errored = false AND
                failed = false AND reached_timeout = false
            LOOP
                SELECT rec.created INTO prev_task_ended;
                SELECT (rec.ended - rec.created) / (SELECT count(*) FROM (SELECT * FROM task WHERE task.processing_graph = 'Order service') AS tasks) INTO average_task_duration;

                FOR task_record IN SELECT * FROM task WHERE task.processing_graph = 'Order service'
                    LOOP
                        SELECT prev_task_ended + '5 milliseconds'::interval * random() INTO task_started;

                        IF task_record.name LIKE '%Split%' THEN
                            FOR g IN SELECT * FROM generate_series(1, ceil(random()*10)::bigint)
                                LOOP
                                    INSERT INTO context (uuid, context)
                                    VALUES (gen_random_uuid(), '{"testData": true}') RETURNING uuid INTO context_uuid;

                                    INSERT INTO task_execution (uuid, routine_execution_id, task_id, context_id, is_scheduled, is_running,
                                                                is_complete, errored, failed, reached_timeout, progress, created, started, ended, deleted)
                                    VALUES (
                                               gen_random_uuid(),
                                               rec.uuid,
                                               task_record.uuid,
                                               context_uuid,
                                               rec.is_scheduled,
                                               rec.is_running,
                                               rec.is_complete,
                                               rec.errored,
                                               rec.failed,
                                               rec.reached_timeout,
                                               rec.progress,
                                               prev_task_ended + '10 milliseconds'::interval * random(),
                                               task_started,
                                               task_started + average_task_duration * 1.2 * random(),
                                               rec.deleted
                                           ) RETURNING ended INTO prev_task_ended;
                                END LOOP;

                        ELSE
                            INSERT INTO context (uuid, context)
                            VALUES (gen_random_uuid(), '{"testData": true}') RETURNING uuid INTO context_uuid;

                            INSERT INTO task_execution (uuid, routine_execution_id, task_id, context_id, is_scheduled, is_running,
                                                        is_complete, errored, failed, reached_timeout, progress, created, started, ended, deleted)
                            VALUES (
                                       gen_random_uuid(),
                                       rec.uuid,
                                       task_record.uuid,
                                       context_uuid,
                                       rec.is_scheduled,
                                       rec.is_running,
                                       rec.is_complete,
                                       rec.errored,
                                       rec.failed,
                                       rec.reached_timeout,
                                       rec.progress,
                                       prev_task_ended + '10 milliseconds'::interval * random(),
                                       task_started,
                                       task_started + average_task_duration * 1.2 * random(),
                                       rec.deleted
                                   ) RETURNING ended INTO prev_task_ended;
                        END IF;
                    END LOOP;

                FOR task_record IN SELECT * FROM task WHERE task.processing_graph = 'Order service'
                    LOOP
                        FOR task_map_record IN SELECT * FROM directional_task_graph_map WHERE predecessor_task_id = task_record.uuid
                            LOOP
                                FOR task_execution_record IN SELECT * FROM task_execution WHERE routine_execution_id = rec.uuid AND task_id = task_record.uuid
                                    LOOP
                                        INSERT INTO task_execution_map (task_execution_id, previous_task_execution_id)
                                            (SELECT
                                                 uuid,
                                                 task_execution_record.uuid
                                             FROM task_execution WHERE routine_execution_id = rec.uuid AND task_id = task_map_record.task_id);
                                    END LOOP;
                            END LOOP;

                    END LOOP;
            END LOOP;
    END
$$;

-- 'Pay order'
DO
$$
    DECLARE
        rec record;
        average_task_duration interval;
        task_record record;
        task_map_record record;
        task_execution_record record;
        context_uuid uuid;
        task_started timestamp;
        prev_task_ended timestamp;
        g record;
    BEGIN
        -- completed records
        FOR rec IN SELECT * FROM routine_execution WHERE description = 'Pay order' AND is_complete = true AND errored = false AND
                failed = false AND reached_timeout = false
            LOOP
                SELECT rec.created INTO prev_task_ended;
                SELECT (rec.ended - rec.created) / (SELECT count(*) FROM (SELECT * FROM task WHERE task.processing_graph = 'Payment service') AS tasks) INTO average_task_duration;

                FOR task_record IN SELECT * FROM task WHERE task.processing_graph = 'Payment service'
                    LOOP
                        SELECT prev_task_ended + '5 milliseconds'::interval * random() INTO task_started;

                        IF task_record.name LIKE '%Split%' THEN
                            FOR g IN SELECT * FROM generate_series(1, ceil(random()*10)::bigint)
                                LOOP
                                    INSERT INTO context (uuid, context)
                                    VALUES (gen_random_uuid(), '{"testData": true}') RETURNING uuid INTO context_uuid;

                                    INSERT INTO task_execution (uuid, routine_execution_id, task_id, context_id, is_scheduled, is_running,
                                                                is_complete, errored, failed, reached_timeout, progress, created, started, ended, deleted)
                                    VALUES (
                                               gen_random_uuid(),
                                               rec.uuid,
                                               task_record.uuid,
                                               context_uuid,
                                               rec.is_scheduled,
                                               rec.is_running,
                                               rec.is_complete,
                                               rec.errored,
                                               rec.failed,
                                               rec.reached_timeout,
                                               rec.progress,
                                               prev_task_ended + '10 milliseconds'::interval * random(),
                                               task_started,
                                               task_started + average_task_duration * 1.2 * random(),
                                               rec.deleted
                                           ) RETURNING ended INTO prev_task_ended;
                                END LOOP;

                        ELSE
                            INSERT INTO context (uuid, context)
                            VALUES (gen_random_uuid(), '{"testData": true}') RETURNING uuid INTO context_uuid;

                            INSERT INTO task_execution (uuid, routine_execution_id, task_id, context_id, is_scheduled, is_running,
                                                        is_complete, errored, failed, reached_timeout, progress, created, started, ended, deleted)
                            VALUES (
                                       gen_random_uuid(),
                                       rec.uuid,
                                       task_record.uuid,
                                       context_uuid,
                                       rec.is_scheduled,
                                       rec.is_running,
                                       rec.is_complete,
                                       rec.errored,
                                       rec.failed,
                                       rec.reached_timeout,
                                       rec.progress,
                                       prev_task_ended + '10 milliseconds'::interval * random(),
                                       task_started,
                                       task_started + average_task_duration * 1.2 * random(),
                                       rec.deleted
                                   ) RETURNING ended INTO prev_task_ended;
                        END IF;
                    END LOOP;

                FOR task_record IN SELECT * FROM task WHERE task.processing_graph = 'Payment service'
                    LOOP
                        FOR task_map_record IN SELECT * FROM directional_task_graph_map WHERE predecessor_task_id = task_record.uuid
                            LOOP
                                FOR task_execution_record IN SELECT * FROM task_execution WHERE routine_execution_id = rec.uuid AND task_id = task_record.uuid
                                    LOOP
                                        INSERT INTO task_execution_map (task_execution_id, previous_task_execution_id)
                                            (SELECT
                                                 uuid,
                                                 task_execution_record.uuid
                                             FROM task_execution WHERE routine_execution_id = rec.uuid AND task_id = task_map_record.task_id);
                                    END LOOP;
                            END LOOP;

                    END LOOP;
            END LOOP;
    END
$$;

-- 'Create shipment order'
DO
$$
    DECLARE
        rec record;
        average_task_duration interval;
        task_record record;
        task_map_record record;
        task_execution_record record;
        context_uuid uuid;
        task_started timestamp;
        prev_task_ended timestamp;
        g record;
    BEGIN
        -- completed records
        FOR rec IN SELECT * FROM routine_execution WHERE description = 'Create shipment order' AND is_complete = true AND errored = false AND
                failed = false AND reached_timeout = false
            LOOP
                SELECT rec.created INTO prev_task_ended;
                SELECT (rec.ended - rec.created) / (SELECT count(*) FROM (SELECT * FROM task WHERE task.processing_graph = 'Shipping service') AS tasks) INTO average_task_duration;

                FOR task_record IN SELECT * FROM task WHERE task.processing_graph = 'Shipping service'
                    LOOP
                        SELECT prev_task_ended + '5 milliseconds'::interval * random() INTO task_started;

                        IF task_record.name LIKE '%Split%' THEN
                            FOR g IN SELECT * FROM generate_series(1, ceil(random()*10)::bigint)
                                LOOP
                                    INSERT INTO context (uuid, context)
                                    VALUES (gen_random_uuid(), '{"testData": true}') RETURNING uuid INTO context_uuid;

                                    INSERT INTO task_execution (uuid, routine_execution_id, task_id, context_id, is_scheduled, is_running,
                                                                is_complete, errored, failed, reached_timeout, progress, created, started, ended, deleted)
                                    VALUES (
                                               gen_random_uuid(),
                                               rec.uuid,
                                               task_record.uuid,
                                               context_uuid,
                                               rec.is_scheduled,
                                               rec.is_running,
                                               rec.is_complete,
                                               rec.errored,
                                               rec.failed,
                                               rec.reached_timeout,
                                               rec.progress,
                                               prev_task_ended + '10 milliseconds'::interval * random(),
                                               task_started,
                                               task_started + average_task_duration * 1.2 * random(),
                                               rec.deleted
                                           ) RETURNING ended INTO prev_task_ended;
                                END LOOP;

                        ELSE
                            INSERT INTO context (uuid, context)
                            VALUES (gen_random_uuid(), '{"testData": true}') RETURNING uuid INTO context_uuid;

                            INSERT INTO task_execution (uuid, routine_execution_id, task_id, context_id, is_scheduled, is_running,
                                                        is_complete, errored, failed, reached_timeout, progress, created, started, ended, deleted)
                            VALUES (
                                       gen_random_uuid(),
                                       rec.uuid,
                                       task_record.uuid,
                                       context_uuid,
                                       rec.is_scheduled,
                                       rec.is_running,
                                       rec.is_complete,
                                       rec.errored,
                                       rec.failed,
                                       rec.reached_timeout,
                                       rec.progress,
                                       prev_task_ended + '10 milliseconds'::interval * random(),
                                       task_started,
                                       task_started + average_task_duration * 1.2 * random(),
                                       rec.deleted
                                   ) RETURNING ended INTO prev_task_ended;
                        END IF;
                    END LOOP;

                FOR task_record IN SELECT * FROM task WHERE task.processing_graph = 'Shipping service'
                    LOOP
                        FOR task_map_record IN SELECT * FROM directional_task_graph_map WHERE predecessor_task_id = task_record.uuid
                            LOOP
                                FOR task_execution_record IN SELECT * FROM task_execution WHERE routine_execution_id = rec.uuid AND task_id = task_record.uuid
                                    LOOP
                                        INSERT INTO task_execution_map (task_execution_id, previous_task_execution_id)
                                            (SELECT
                                                 uuid,
                                                 task_execution_record.uuid
                                             FROM task_execution WHERE routine_execution_id = rec.uuid AND task_id = task_map_record.task_id);
                                    END LOOP;
                            END LOOP;

                    END LOOP;
            END LOOP;
    END
$$;

-- 'Send SMS'
DO
$$
    DECLARE
        rec record;
        average_task_duration interval;
        task_record record;
        task_map_record record;
        task_execution_record record;
        context_uuid uuid;
        task_started timestamp;
        prev_task_ended timestamp;
        g record;
    BEGIN
        -- completed records
        FOR rec IN SELECT * FROM routine_execution WHERE description = 'Send SMS' AND is_complete = true AND errored = false AND
                failed = false AND reached_timeout = false
            LOOP
                SELECT rec.created INTO prev_task_ended;
                SELECT (rec.ended - rec.created) / (SELECT count(*) FROM (SELECT * FROM task WHERE task.processing_graph = 'Customer communication service') AS tasks) INTO average_task_duration;

                FOR task_record IN SELECT * FROM task WHERE task.processing_graph = 'Customer communication service' AND task.name LIKE '%SMS%'
                    LOOP
                        SELECT prev_task_ended + '5 milliseconds'::interval * random() INTO task_started;

                        IF task_record.name LIKE '%Split%' THEN
                            FOR g IN SELECT * FROM generate_series(1, ceil(random()*10)::bigint)
                                LOOP
                                    INSERT INTO context (uuid, context)
                                    VALUES (gen_random_uuid(), '{"testData": true}') RETURNING uuid INTO context_uuid;

                                    INSERT INTO task_execution (uuid, routine_execution_id, task_id, context_id, is_scheduled, is_running,
                                                                is_complete, errored, failed, reached_timeout, progress, created, started, ended, deleted)
                                    VALUES (
                                               gen_random_uuid(),
                                               rec.uuid,
                                               task_record.uuid,
                                               context_uuid,
                                               rec.is_scheduled,
                                               rec.is_running,
                                               rec.is_complete,
                                               rec.errored,
                                               rec.failed,
                                               rec.reached_timeout,
                                               rec.progress,
                                               prev_task_ended + '10 milliseconds'::interval * random(),
                                               task_started,
                                               task_started + average_task_duration * 1.2 * random(),
                                               rec.deleted
                                           ) RETURNING ended INTO prev_task_ended;
                                END LOOP;

                        ELSE
                            INSERT INTO context (uuid, context)
                            VALUES (gen_random_uuid(), '{"testData": true}') RETURNING uuid INTO context_uuid;

                            INSERT INTO task_execution (uuid, routine_execution_id, task_id, context_id, is_scheduled, is_running,
                                                        is_complete, errored, failed, reached_timeout, progress, created, started, ended, deleted)
                            VALUES (
                                       gen_random_uuid(),
                                       rec.uuid,
                                       task_record.uuid,
                                       context_uuid,
                                       rec.is_scheduled,
                                       rec.is_running,
                                       rec.is_complete,
                                       rec.errored,
                                       rec.failed,
                                       rec.reached_timeout,
                                       rec.progress,
                                       prev_task_ended + '10 milliseconds'::interval * random(),
                                       task_started,
                                       task_started + average_task_duration * 1.2 * random(),
                                       rec.deleted
                                   ) RETURNING ended INTO prev_task_ended;
                        END IF;
                    END LOOP;

                FOR task_record IN SELECT * FROM task WHERE task.processing_graph = 'Customer communication service' AND task.name LIKE '%SMS%'
                    LOOP
                        FOR task_map_record IN SELECT * FROM directional_task_graph_map WHERE predecessor_task_id = task_record.uuid
                            LOOP
                                FOR task_execution_record IN SELECT * FROM task_execution WHERE routine_execution_id = rec.uuid AND task_id = task_record.uuid
                                    LOOP
                                        INSERT INTO task_execution_map (task_execution_id, previous_task_execution_id)
                                            (SELECT
                                                 uuid,
                                                 task_execution_record.uuid
                                             FROM task_execution WHERE routine_execution_id = rec.uuid AND task_id = task_map_record.task_id);
                                    END LOOP;
                            END LOOP;

                    END LOOP;
            END LOOP;
    END
$$;

-- 'Send Email'
DO
$$
    DECLARE
        rec record;
        average_task_duration interval;
        task_record record;
        task_map_record record;
        task_execution_record record;
        context_uuid uuid;
        task_started timestamp;
        prev_task_ended timestamp;
        g record;
    BEGIN
        -- completed records
        FOR rec IN SELECT * FROM routine_execution WHERE description = 'Send Email' AND is_complete = true AND errored = false AND
                failed = false AND reached_timeout = false
            LOOP
                SELECT rec.created INTO prev_task_ended;
                SELECT (rec.ended - rec.created) / (SELECT count(*) FROM (SELECT * FROM task WHERE task.processing_graph = 'Customer communication service') AS tasks) INTO average_task_duration;

                FOR task_record IN SELECT * FROM task WHERE task.processing_graph = 'Customer communication service' AND task.name LIKE '%Email%'
                    LOOP
                        SELECT prev_task_ended + '5 milliseconds'::interval * random() INTO task_started;

                        IF task_record.name LIKE '%Split%' THEN
                            FOR g IN SELECT * FROM generate_series(1, ceil(random()*10)::bigint)
                                LOOP
                                    INSERT INTO context (uuid, context)
                                    VALUES (gen_random_uuid(), '{"testData": true}') RETURNING uuid INTO context_uuid;

                                    INSERT INTO task_execution (uuid, routine_execution_id, task_id, context_id, is_scheduled, is_running,
                                                                is_complete, errored, failed, reached_timeout, progress, created, started, ended, deleted)
                                    VALUES (
                                               gen_random_uuid(),
                                               rec.uuid,
                                               task_record.uuid,
                                               context_uuid,
                                               rec.is_scheduled,
                                               rec.is_running,
                                               rec.is_complete,
                                               rec.errored,
                                               rec.failed,
                                               rec.reached_timeout,
                                               rec.progress,
                                               prev_task_ended + '10 milliseconds'::interval * random(),
                                               task_started,
                                               task_started + average_task_duration * 1.2 * random(),
                                               rec.deleted
                                           ) RETURNING ended INTO prev_task_ended;
                                END LOOP;

                        ELSE
                            INSERT INTO context (uuid, context)
                            VALUES (gen_random_uuid(), '{"testData": true}') RETURNING uuid INTO context_uuid;

                            INSERT INTO task_execution (uuid, routine_execution_id, task_id, context_id, is_scheduled, is_running,
                                                        is_complete, errored, failed, reached_timeout, progress, created, started, ended, deleted)
                            VALUES (
                                       gen_random_uuid(),
                                       rec.uuid,
                                       task_record.uuid,
                                       context_uuid,
                                       rec.is_scheduled,
                                       rec.is_running,
                                       rec.is_complete,
                                       rec.errored,
                                       rec.failed,
                                       rec.reached_timeout,
                                       rec.progress,
                                       prev_task_ended + '10 milliseconds'::interval * random(),
                                       task_started,
                                       task_started + average_task_duration * 1.2 * random(),
                                       rec.deleted
                                   ) RETURNING ended INTO prev_task_ended;
                        END IF;
                    END LOOP;

                FOR task_record IN SELECT * FROM task WHERE task.processing_graph = 'Customer communication service' AND task.name LIKE '%Email%'
                    LOOP
                        FOR task_map_record IN SELECT * FROM directional_task_graph_map WHERE predecessor_task_id = task_record.uuid
                            LOOP
                                FOR task_execution_record IN SELECT * FROM task_execution WHERE routine_execution_id = rec.uuid AND task_id = task_record.uuid
                                    LOOP
                                        INSERT INTO task_execution_map (task_execution_id, previous_task_execution_id)
                                            (SELECT
                                                 uuid,
                                                 task_execution_record.uuid
                                             FROM task_execution WHERE routine_execution_id = rec.uuid AND task_id = task_map_record.task_id);
                                    END LOOP;
                            END LOOP;

                    END LOOP;
            END LOOP;
    END
$$;

-- SELECT * FROM server;
-- SELECT * FROM task_execution_map;
