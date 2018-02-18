using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class LockPosition : MonoBehaviour {

	[SerializeField] Transform target;
	
	// Update is called once per frame
	void Update () {
		transform.position = new Vector3 (target.position.x, target.position.y - (float)1.7, target.position.z);
	}
}
