const assert = require('assert');

let data = { selectedFund: 'rosmol' };

// simulate handleGroupSelect
const groupValue = "Школьники";
const currentGroups = Array.isArray(data.targetGroups) ? [...data.targetGroups] : [];
const isAlreadySelected = currentGroups.includes(groupValue);

let newGroups = [];
if (true) {
  if (isAlreadySelected) {
    newGroups = currentGroups.filter(g => g !== groupValue);
  } else {
    newGroups = [...currentGroups, groupValue];
  }
}

let newPrimary = data.primaryTargetGroup;
if (newGroups.length === 0) {
  newPrimary = '';
} else if (newGroups.length === 1) {
  newPrimary = newGroups[0];
} else if (!newGroups.includes(newPrimary)) {
  newPrimary = newGroups[0];
}

data = {
  ...data,
  targetGroups: newGroups,
  primaryTargetGroup: newPrimary,
  customTargetGroup: (newGroups.includes('other') ? data.customTargetGroup : '')
};

console.log(data);
