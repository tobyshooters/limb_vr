using System.Collections;
using UnityEngine.UI;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

public class DemoCanvasScript : MonoBehaviour {

	public Canvas MainCanvas;
	public Canvas OptionsCanvas;
	public Canvas ChooseDemoCanvas;


	void Update ()
	{
		OVRInput.Update(); // need to be called for checks below to work

		// MAP SOUND ON/OFF IF WE HAVE TIMEEEEEEEEEEEEEEEEEEEEEEEEEEE

		if (OVRInput.Get(OVRInput.Button.One)) {
			SceneManager.LoadScene ("TestAnimation", LoadSceneMode.Single); 
		}

	}
}
