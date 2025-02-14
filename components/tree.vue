<template>
<div>
  <div id="svg-tree" style="width: 100%; height: 100%;"></div>
</div>

</template>

<script setup>

import ApexTree from 'apextree';

const options = {
  contentKey: 'name',
  width: '65dvw',
  height: '50dvh',
  nodeWidth: 180,
  nodeHeight: 50,
  childrenSpacing: 180,
  siblingSpacing: 30,
  direction: 'left',
  fontSize: '20px',
  fontFamily: 'Quicksand, sans-serif',
  fontWeight: '600',
  fontColor: '#388ac4',
  borderColorHover: '#388ac4',
  nodeBGColorHover: '#d7d7d7',
  enableToolbar: true,
  enableExpandCollapse: true,
  canvasStyle: 'background: none',
};
onMounted(async () => {
  const serverMap = await $fetch('/api/serverMap');
  const tree = new ApexTree(document.getElementById('svg-tree'), options);

  if (serverMap && serverMap.length > 0) {
    const generateTreeData = (servers, parentId = null) => {
      return servers
        .filter(server => server.client_id === parentId)
        .map(server => ({
          id: server.server_id.toString(),
          name: server.processing_graph,
          children: generateTreeData(servers, server.server_id)
        }));
    };

    const dynamicData = {
      id: 'root',
      name: 'Server Map',
      children: generateTreeData(serverMap)
    };

    tree.render(dynamicData);
  }
});

// onMounted(() => {
//   const tree = new ApexTree(document.getElementById('svg-tree'), options);
//   tree.render(data);
//   });

// const tree = new ApexTree(document.getElementById('svg-tree'), options);
// tree.render(data);
</script>
